const path = require("path");
const { Storage, Bucket } = require("@google-cloud/storage");

// GCP creds/info
const projectID = process.env.GCP_PROJECT_ID;
const storage = new Storage({
    keyFilename: path.join(__dirname, "../prodCreds.json"),
    projectId: projectID,
});

const deleteGCPFile = async (fileNameArr, bucket) => {
    for await (fileName of fileNameArr) {
        try {
            await bucket.deleteFiles({ prefix: fileName });
            console.log(`Deleting ${fileName} from GCP`);
        } catch (err) {
            console.log(
                `There was an error deleting the file: ${fileName} from GCP`
            );
            throw err;
        }
    }
    return true;
};

// Access GCP, Combine and Delete chunks to a single file
const combineMultiGCP = async (previousTransfer) => {
    const keys = Object.keys(previousTransfer);
    // loop over all collections with multiple files to use the GCP combine method
    for await (key of keys) {
        let gcpBucket;

        if (key.includes("caliper")) {
            gcpBucket = process.env.GCP_CALIPER_BUCKET_NAME;
        } else if (key.includes("stillwater") || key.includes("Metric")) {
            gcpBucket = process.env.GCP_STILLWATER_BUCKET_NAME;
        }

        const bucket = new Bucket(storage, gcpBucket);
        await bucket
            .combine(previousTransfer[key], `${key}.jsonl`)
            .catch((err) => {
                throw err;
            });
    }

    // clean up and delete files stored on GCP after combining
    for await (key of keys) {
        let gcpBucket;

        if (key.includes("caliper")) {
            gcpBucket = process.env.GCP_CALIPER_BUCKET_NAME;
        } else if (key.includes("stillwater") || key.includes("Metric")) {
            gcpBucket = process.env.GCP_STILLWATER_BUCKET_NAME;
        }

        const bucket = new Bucket(storage, gcpBucket);
        await deleteGCPFile(previousTransfer[key], bucket).catch((err) => {
            throw err;
        });
    }
};

module.exports = { combineMultiGCP };
