const { retrieveCollection } = require("./mdbExtract");
const fs = require("fs");

const newArray = [];

async function writeProductAvail(collectionName, query) {
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

    // console.log("data from productAvailability", newArray);

    const data = JSON.stringify(newArray);

    fs.writeFile(`./tmp/${collectionName}.json`, data, function (error) {
        if (error) {
            console.log("error in writing productAvailability file", error);
        } else {
            console.log("productAvailability file created");
        }
    });
}

module.exports = { writeProductAvail };
