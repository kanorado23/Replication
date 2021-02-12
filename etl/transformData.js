// setup/imports
const { retrieveCollection } = require("./mdbExtract");
const fs = require("fs");

// replaces any character in object keys that is not a letter, number, or underscore with underscore
const filterObjectKeys = (obj) => {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
        const filteredKey = key.replace(/[^a-zA-Z0-9_]/g, "_");
        newObj[filteredKey] = obj[key];
    }
    return newObj;
};

// create .jsonl file from retrieved data
async function transformData(collectionName, query) {
    let newStr = "";

    // retrieves collection data
    let buildSheet = await retrieveCollection(query, collectionName);

    console.log(buildSheet);

    // replaces _id with mdb_id in each object
    for (i in buildSheet) {
        if (buildSheet[i]["_id"]) {
            buildSheet[i] = { mdb_id: buildSheet[i]["_id"], ...buildSheet[i] };
            delete buildSheet[i]["_id"];
        }
        // filters first layer of object keys
        buildSheet[i] = filterObjectKeys(buildSheet[i]);
        for (j in buildSheet[i]) {
            // filters nested layer of object keys
            if (
                typeof buildSheet[i][j] === "object" &&
                buildSheet[i][j] !== null &&
                j !== "mdb_id" &&
                !Array.isArray(buildSheet[i][j])
            ) {
                buildSheet[i][j] = filterObjectKeys(buildSheet[i][j]);
            }
        }

        newStr += JSON.stringify(buildSheet[i]) + "\n";
    }

    console.log(
        `\n \n Transformed data for ${collectionName} \n ${newStr} \n \n`
    );

    // writes jsonl file in tmp folder
    await fs.writeFile(
        `./tmp/${collectionName}.jsonl`,
        newStr,
        function (error) {
            if (error) {
                console.log(`error in writing ${collectionName} file`, error);
            } else {
                console.log(`${collectionName} file created`);
            }
        }
    );
}

module.exports = { transformData };
