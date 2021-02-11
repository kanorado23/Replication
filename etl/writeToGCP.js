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
        await writeToGCP(collection.collectionName, collection.query);
    }
};

// write file to GCP then delete file when finished
async function writeToGCP(collectionName, query) {
    // creates file to be loaded to GCP
    await transformData(collectionName, query);

    console.log(`collectionFunction for ${collectionName} complete`);

    // gcp buckte name for caliper or stillwater
    let gcpBucket;
    if (collectionName.includes("caliper")) {
        gcpBucket = process.env.GCP_CALIPER_BUCKET_NAME;
    } else if (collectionName.includes("stillwater")) {
        gcpBucket = process.env.GCP_STILLWATER_BUCKET_NAME;
    }

    // gcp bucket/file/metadata info
    const bucketName = storage.bucket(gcpBucket);
    // const file = bucketName.file(`${collectionName}-${Date.now()}.jsonl`);
    const file = bucketName.file(`${collectionName}.jsonl`);
    const metadata = { metadata: { contentType: "application/octet-stream" } };

    // writes file to gcp and deletes file when successful
    await fs
        .createReadStream(`./tmp/${collectionName}.jsonl`)
        .pipe(file.createWriteStream(metadata))
        .on("error", (err) => {
            console.log("GCP upload error", err);
        })
        .on("finish", () => {
            console.log(`${collectionName} file uploaded`);
            // if upload is successful, delete file
            fs.unlink(`./tmp/${collectionName}.jsonl`, (err) => {
                if (err) {
                    console.log("error deleting file", err);
                } else {
                    console.log(`${collectionName} file deleted`);
                }
            });
        });
}

module.exports = { writeAll };
