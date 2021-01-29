const fs = require("fs");
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const { collectionsInfo } = require("../collections/collectionsInfo");

// to do update the creds with GCP creds & Project Name
// Complete -- AMR
const projectID = process.env.GCP_PROJECT_ID;

const storage = new Storage({
    keyFilename: path.join(__dirname, "../prodCreds.json"),
    projectId: projectID,
});

//explicitly set the file type to csv to do get this set

const metadata = {
    sourceFormat: "CSV",
    skipLeadingRows: 1,
};

const collections = collectionsInfo();

const writeAll = (collections) => {
    for (const collection of collections) {
        writeToGCP(collection.collectionName, collection.collectionFunction);
    }
};

async function writeToGCP(collectionName, collectionFunction) {
    //to do - right now this manually being done - iterate through and update collection to call the appropriate database to write the csv file
    const data = await collectionFunction();

    console.log("data from collectionFunction", data);

    // const bucketName = storage.bucket("replicaliper");

    // //to do - right now manually updating the name of the file- similar to line 25 - make line 32 write file to the appropriate collection automatically
    // const file = bucketName.file(collectionName);
    // //update file to JSON
    // await fs
    //     .createReadStream(`../tmp/${collectionName}.csv`)
    //     .pipe(file.createWriteStream())

    //     .on("error", function (err) {
    //         console
    //             .log("error line 19 " + err)

    //             .on("finish", function () {
    //                 console.log("file upload complete");
    //             });
    //     });
}

writeAll(collections);
// module.exports = { writeToGCP };
