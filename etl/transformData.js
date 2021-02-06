// setup/imports
const { retrieveCollection } = require("./mdbExtract");
const fs = require("fs");

// create .jsonl file from retrieved data
async function transformData(collectionName, query) {
    let newStr = "";

    // retrieves collection data
    const buildSheet = await retrieveCollection(query, collectionName);

    // replaces _id with mdb_id in each object
    for (i in buildSheet) {
        if (buildSheet[i]["_id"]) {
            buildSheet[i] = { mdb_id: buildSheet[i]["_id"], ...buildSheet[i] };
            delete buildSheet[i]["_id"];
        }
        newStr += JSON.stringify(buildSheet[i]) + "\n";
    }

    // console.log(`${collectionName} \n ${newStr} \n \n`);

    // writes jsonl file in tmp folder
    fs.writeFile(`./tmp/${collectionName}.jsonl`, newStr, function (error) {
        if (error) {
            console.log(`error in writing ${collectionName} file`, error);
        } else {
            console.log(`${collectionName} file created`);
        }
    });
}

module.exports = { transformData };
