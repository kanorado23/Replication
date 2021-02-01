const fs = require("fs");
const path = require("path");
const { Storage } = require("@google-cloud/storage");

// to do update the creds with GCP creds & Project Name
// Complete -- AMR
const projectID = process.env.GCP_PROJECT_ID;

const storage = new Storage({
    keyFilename: path.join(__dirname, "../prodCreds.json"),
    projectId: projectID,
});

//explicitly set the file type to csv to do get this set
// ??????????????????????????????????????????????????
const metadata = {
    sourceFormat: "CSV",
    skipLeadingRows: 1,
};

const writeAll = async (collections) => {
    for (const collection of collections) {
        await writeToGCP(
            collection.collectionName,
            collection.collectionFunction,
            collection.gcpBucket,
            collection.query
        );
    }
};

async function writeToGCP(
    collectionName,
    collectionFunction,
    gcpBucket,
    query
) {
    // to do - right now this manually being done - iterate through and update collection to call the appropriate database to write the csv file
    // Complete -- AMR
    const data = await collectionFunction(collectionName, query);

    console.log(`collectionFunction for ${collectionName} complete`);

    const bucketName = storage.bucket(gcpBucket);

    //to do - right now manually updating the name of the file- similar to line 25 - make line 32 write file to the appropriate collection automatically
    // Complete -- AMR

    // Use time stamp for file name
    const timeStamp = Date.now();

    const file = bucketName.file(timeStamp);

    // to do - update file to JSON
    // Complete -- AMR
    await fs
        .createReadStream(`./tmp/${collectionName}.json`)
        .pipe(file.createWriteStream())

        .on("error", (err) => {
            console.log("GCP upload error", err);
        })
        .on("finish", () => {
            console.log(`${collectionName} file uploaded`);
            // if upload is successful, delete file
            fs.unlink(`./tmp/${collectionName}.json`, (err) => {
                if (err) {
                    console.log("error deleting file", err);
                } else {
                    console.log(`${collectionName} file deleted`);
                }
            });
        });
}

module.exports = { writeAll };
