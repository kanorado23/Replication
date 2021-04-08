const path = require("path");
const fs = require("fs");
const { Storage, Bucket } = require("@google-cloud/storage");

// GCP creds/info
const projectID = process.env.GCP_PROJECT_ID;
const storage = new Storage({
    keyFilename: path.join(__dirname, "../prodCreds.json"),
    projectId: projectID,
});

const deleteGCPFile = async (fileNameArr, bucket) => {
    for (fileName of fileNameArr) {
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
        await previousPromise.catch((err) => {
            throw err;
        });

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
        return bucket
            .combine(previousTransfer[nextKey], nextKey)
            .catch((err) => {
                throw err;
            });
    }, Promise.resolve());

    // clean up and delete files stored on GCP after combining
    Object.keys(previousTransfer).reduce(async (previousPromise, nextKey) => {
        await previousPromise.catch((err) => {
            throw err;
        });

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
        return deleteGCPFile(previousTransfer[nextKey], bucket).catch((err) => {
            throw err;
        });
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
