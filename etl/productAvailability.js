const json2Csv = require("json2csv").Parser;
const { retrieveCollection } = require("./mdbExtract");
const fs = require("fs");

// variables for retrieveCollection
const collectionName = "caliper.co.wholesale.productAvailability";
const query = {};

const newArray = [];

async function writeProductAvail() {
    const buildSheet = await retrieveCollection(query, collectionName);

    const headers = [
        "MongoId",
        "ID",
        "Allocated",
        "Available",
        "Barcode",
        "Batch",
        "Bin",
        "ExpiryDate",
        "Location",
        "Name",
        "OnHand",
        "OnOrder",
        "SKU",
        "StockOnHand",
    ];

    for (i in buildSheet) {
        const sheet = buildSheet[i];

        newArray.push([
            sheet._id,
            sheet.ID,
            sheet.Allocated,
            sheet.Available,
            sheet.Barcode,
            sheet.Batch,
            sheet.Bin,
            sheet.ExpiryDate,
            sheet.Location,
            sheet.Name,
            sheet.OnHand,
            sheet.OnOrder,
            sheet.SKU,
            sheet.StockOnHand,
        ]);
    }

    newArray.unshift(headers);

    console.log("data from productAvailability", newArray);

    const data = new json2Csv({ header: false });
    const csvData = data.parse(newArray);

    fs.writeFile("../tmp/productAvailability.csv", csvData, function (error) {
        if (error) {
            console.log("error in writing products file", error);
        } else {
            console.log("products file created");
        }
    });
}

module.exports = { writeProductAvail };
