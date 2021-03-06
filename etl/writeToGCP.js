// setup/imports
const { transformData } = require("./transformData");
const fs = require("fs");
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const util = require("util");
const stream = require("stream");

// Creates a wrapper so that stream pipeline can use await like a Promise
const pipeline = util.promisify(stream.pipeline);

// GCP creds/info
const projectID = process.env.GCP_PROJECT_ID;
const storage = new Storage({
    keyFilename: path.join(__dirname, "../prodCreds.json"),
    projectId: projectID,
});

// writeToGCP for each collection in list
const writeAll = async (collections) => {
    let remaining = collections.length;
    console.log(`Getting ${remaining} ${remaining === 1 ? "query" : "queries"}:`);
    for await (const collection of collections) {
        try {
            await transformData(
                collection.collectionName,
                collection.query ? collection.query : {}
            );
            remaining -= 1;
            console.log(
                `--${remaining} ${remaining == 1 ? "query" : "queries"} remaining--`
            );
        } catch (err) {
            console.log("Error transforming data");
            throw err;
        }
    }

    // store collections that are uploaded in chunks
    const multiFileCollections = {};
    // track how many files need to be combined
    let toCombine = 0;

    // create array of files in tmp/
    const fileNames = fs.readdirSync("./tmp/").filter((file) => {
        const isJSONL = file.includes(".jsonl");
        if (isJSONL) {
            const numIdx = file.indexOf("-");
            if (numIdx > -1) {
                const colName = file.slice(0, numIdx);

                if (multiFileCollections.hasOwnProperty(colName)) {
                    multiFileCollections[colName].push(file);
                } else {
                    // initializing key value pair if not on obj
                    multiFileCollections[colName] = [file];
                }

                toCombine += 1;
            }
        }

        // filter out non-JSON-line files
        return isJSONL;
    });

    for await (const file of fileNames) {
        // gcp buckte name for caliper or stillwater
        let gcpBucket;
        if (file.includes("caliper")) {
            gcpBucket = process.env.GCP_CALIPER_BUCKET_NAME;
        } else if (file.includes("stillwater") || file.includes("Metrc")) {
            gcpBucket = process.env.GCP_STILLWATER_BUCKET_NAME;
        }

        // gcp bucket/file/metadata info
        const bucketName = storage.bucket(gcpBucket);
        // const file = bucketName.file(`${collectionName}-${Date.now()}.jsonl`);
        const gcpFile = bucketName.file(file);
        const metadata = {
            resumable: false,
            metadata: { contentType: "application/octet-stream" },
        };

        // writes file to gcp and deletes file when successful
        await pipeline(
            fs.createReadStream(`./tmp/${file}`),
            gcpFile.createWriteStream(metadata)
        )
            .then((res) => {
                console.log(`${file} file uploaded`);
                // if upload is successful, delete file
                fs.unlink(`./tmp/${file}`, (err) => {
                    if (err) {
                        console.log("error deleting file", err);
                        throw "Error deleting file";
                    } else {
                        console.log(`${file} file deleted`);
                    }
                });
            })
            .catch((err) => {
                console.log("GCP upload error", err);
                throw err;
            });
    }
    return { qty: toCombine, multiFileCollections };
};

module.exports = { writeAll };
