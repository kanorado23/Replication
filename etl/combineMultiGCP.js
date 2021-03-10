const path = require("path");
const fs = require("fs");
const { Storage, Bucket } = require("@google-cloud/storage");
const { file } = require("googleapis/build/src/apis/file");

// GCP creds/info
const projectID = process.env.GCP_PROJECT_ID;
const storage = new Storage({
    keyFilename: path.join(__dirname, "../prodCreds.json"),
    projectId: projectID,
});

// Access GCP, Combine and Delete chunks to a single file
const combineMultiGCP = async () => {
    let previousTransfer;

    try {
        previousTransfer = JSON.parse(
            fs.readFileSync("./tmp/previousTransfer.json")
        );
    } catch (err) {
        throw "previousTransfer.json file not found; please run an 'etl/' get first";
    }

    // loop over all collections with multiple files to use the GCP combine method
    Object.keys(previousTransfer).reduce(async (previousPromise, nextKey) => {
        await previousPromise;

        let gcpBucket;

        if (nextKey.includes("caliper")) {
            gcpBucket = process.env.GCP_CALIPER_BUCKET_NAME;
        } else if (
            nextKey.includes("stillwater") ||
            nextKey.includes("Metrc")
        ) {
            gcpBucket = process.env.GCP_STILLWATER_BUCKET_NAME;
        }

        const bucket = new Bucket(storage, gcpBucket);
        return bucket.combine(previousTransfer[nextKey], nextKey);
    }, Promise.resolve());

    // remove temp previousTransfer file
    fs.unlink("./tmp/previousTransfer.json", (err) => {
        if (err) {
            console.log("error deleting file", err);
        } else {
            console.log("previousTransfer.json deleted");
        }
    });
};

module.exports = { combineMultiGCP };
