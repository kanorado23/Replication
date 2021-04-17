// setup/imports
const router = require("express").Router();
const { writeAll } = require("../etl/writeToGCP");
const { combineMultiGCP } = require("../etl/combineMultiGCP");
const { collectionsInfo } = require("../collections/collectionsInfo");
const { getCollectionNames } = require("../collections/retrievedCollections");
const fs = require("fs");

// handles /api/etl get requests
// accepts a query param of 'name' to filter which collections are used
//     Ex: `/api/etl/?name=woo`
router.get("/", async (req, res) => {
    // grab name off query & if name exists, set it lowercase
    const name = req.query.name?.toLowerCase();
    let collections = [];
    try {
        collections = await getCollectionNames();
        if (name) {
            collections = collections.filter((col) =>
                col.collectionName.includes(name)
            );
        }
    } catch (err) {
        res.status(500).json({ message: "Error accessing MongoDB", err });
    }
    // const collections = collectionsInfo();

    try {
        const previousTransfer = await writeAll(collections);

        console.log(
            `... ...Waiting ${
                previousTransfer.qty * 28 + 2
            } seconds for uploads to complete... ...`
        );
        setTimeout(async () => {
            console.log("STARTING: COMBINING");

            // check if all files were uploaded
            const jsonlFiles = fs.readdirSync("./tmp/").filter((file) => {
                return file.includes(".jsonl");
            });

            const extraWait =
                jsonlFiles.length == 0 ? 0 : jsonlFiles.length * 10000;

            console.log(
                `... ... Waiting for an extra ${extraWait} ms for uploads to complete... ...`
            );
            setTimeout(async () => {
                // merges chunks and deletes from GCP
                try {
                    await combineMultiGCP(
                        previousTransfer.multiFileCollections
                    );
                } catch (err) {
                    console.log("etl combine error", err);
                    res.status(500).json({
                        message: "There was an error with combining ETL",
                        error: err,
                    });
                }
            }, extraWait);

            setTimeout(() => {
                console.log("      End of request     ");
                res.status(200).json({
                    msg: "ETL Successful",
                });
            }, previousTransfer.qty * 200 + 1000);

            // set a 2000ms default delay
        }, previousTransfer.qty * 28000 + 2000);
    } catch (err) {
        console.log("etl get error", err);
        res.status(500).json({
            message: "There was an error with ETL",
            error: err,
        });
    }
});

module.exports = router;
