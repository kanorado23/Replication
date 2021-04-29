// setup/imports
const { retrieveCollection } = require("./mdbExtract");
const fs = require("fs").promises;

// replaces any character in object keys that is not a letter, number, or underscore with underscore
const filterObjectKeys = (obj) => {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
        let filteredKey = key.replace(/[^a-zA-Z0-9_]/g, "_");
        if (filteredKey === "1__Off") {
            filteredKey = "Dollar_Off";
        }
        newObj[filteredKey] = obj[key];
    }
    return newObj;
};

const transformMisc = (arr) => {
    let newStr = "";

    for (const i in arr) {
        // changes key from _id to mdb_id
        if (arr[i]["_id"]) {
            arr[i] = { mdb_id: arr[i]["_id"], ...arr[i] };
            delete arr[i]["_id"];
        }

        // filters first layer of object keys
        arr[i] = filterObjectKeys(arr[i]);
        for (const j in arr[i]) {
            // filters nested layer of object keys
            if (
                typeof arr[i][j] === "object" &&
                arr[i][j] !== null &&
                j !== "mdb_id" &&
                !Array.isArray(arr[i][j])
            ) {
                arr[i][j] = filterObjectKeys(arr[i][j]);
            }
        }

        // add new line to newStr
        newStr += JSON.stringify(arr[i]) + "\n";
    }

    return newStr;
};

const transformWoo = (arr) => {
    let newStr = "";

    for (const i in arr) {
        // changes key from _id to mdb_id
        if (arr[i]["_id"]) {
            arr[i] = { mdb_id: arr[i]["_id"], ...arr[i] };
            delete arr[i]["_id"];
        }

        // filters first layer of object keys
        arr[i] = filterObjectKeys(arr[i]);
        for (const j in arr[i]) {
            // filters nested layer of object keys
            if (
                typeof arr[i][j] === "object" &&
                arr[i][j] !== null &&
                j !== "mdb_id" &&
                j !== "meta_data" &&
                j !== "_links" &&
                !Array.isArray(arr[i][j])
            ) {
                arr[i][j] = filterObjectKeys(arr[i][j]);
            }

            // Stringify deeply nested objects
            if (j === "meta_data" || j === "_links") {
                arr[i][j] = JSON.stringify(arr[i][j]);
            }

            if (Array.isArray(arr[i][j])) {
                for (const k in arr[i][j]) {
                    for (const l in arr[i][j][k])
                        if (l === "meta_data") {
                            arr[i][j][k][l] = JSON.stringify(arr[i][j][k][l]);
                        }
                }
            }
        }

        // add new line to newStr
        newStr += JSON.stringify(arr[i]) + "\n";
    }

    return newStr;
};

// transforms data from array and creates jsonl file
const transformAndCreateFile = async (arr, collectionName) => {
    let newStr = "";

    // newStr = transformMisc(arr)
    if (collectionName.toLowerCase().includes("woo")) {
        newStr = transformWoo(arr);
    } else {
        newStr = transformMisc(arr);
    }

    // writes jsonl file in tmp folder
    try {
        await fs.writeFile(`./tmp/${collectionName}.jsonl`, newStr);
        console.log(`${collectionName} file created`);
    } catch (error) {
        console.log(`error in writing ${collectionName} file`, error);
        throw error;
    }
};

// create .jsonl file from retrieved data
async function transformData(collectionName, query) {
    // retrieves collection data
    let buildSheet = await retrieveCollection(query, collectionName).catch((err) => {
        console.log("Error retrieveing from MongoDB", err);
        throw err;
    });

    // if buildSheet has more than 5000 items, create files 5000 items at a time
    if (buildSheet.length > 5000) {
        let start = 0;
        let end = 5000;
        let buildSheetArr = [];

        while (start < buildSheet.length) {
            const subBuildSheet = buildSheet.slice(start, end);
            buildSheetArr.push(subBuildSheet);
            start += 5000;
            end = end + 5000 < buildSheet.length ? end + 5000 : buildSheet.length;
        }

        for (let i in buildSheetArr) {
            transformAndCreateFile(buildSheetArr[i], `${collectionName}-${i}`);
        }
        // if fewer than 5000 items, creates single file
    } else if (buildSheet.length <= 5000) {
        transformAndCreateFile(buildSheet, collectionName);
    }
}

module.exports = { transformData };
