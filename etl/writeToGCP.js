// setup/imports
const { transformData } = require("./transformData");
const fs = require("fs");
const path = require("path");
const { Storage } = require("@google-cloud/storage");

// GCP creds/info
const projectID = process.env.GCP_PROJECT_ID;
const storage = new Storage({
    keyFilename: path.join(__dirname, "../prodCreds.json"),
    projectId: projectID,
});

// writeToGCP for each collection in list
const writeAll = async (collections) => {
    for (const collection of collections) {
        await transformData(
            collection.collectionName,
            collection.query ? collection.query : {}
        );
    }

    // create array of files in tmp/
    const fileNames = fs
        .readdirSync("./tmp/")
        .filter((file) => file !== ".DS_Store");

    // console.log("file names", fileNames);

    fileNames.forEach(async (file) => {
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
            metadata: { contentType: "application/octet-stream" },
        };

        // writes file to gcp and deletes file when successful
        fs.createReadStream(`./tmp/${file}`)
            .pipe(gcpFile.createWriteStream(metadata))
            .on("error", (err) => {
                console.log("GCP upload error", err);
            })
            .on("finish", () => {
                console.log(`${file} file uploaded`);
                // if upload is successful, delete file
                fs.unlink(`./tmp/${file}`, (err) => {
                    if (err) {
                        console.log("error deleting file", err);
                    } else {
                        console.log(`${file} file deleted`);
                    }
                });
            });
    });
};

module.exports = { writeAll };
