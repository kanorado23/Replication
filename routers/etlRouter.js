// setup/imports
const router = require("express").Router();
const { writeAll } = require("../etl/writeToGCP");
const { combineMultiGCP } = require("../etl/combineMultiGCP");
const { collectionsInfo } = require("../collections/collectionsInfo");
const { getCollectionNames } = require("../collections/retrievedCollections");
const fs = require("fs");

// handles /api/etl get requests
router.get("/", async (req, res) => {
    // const collections = collectionsInfo();
    const collections = await getCollectionNames();

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

            try {
                const extraWait =
                    jsonlFiles.length == 0 ? 0 : jsonlFiles.length * 10000;

                console.log(
                    `... ... Waiting for an extra ${extraWait} ms for uploads to complete... ...`
                );
                setTimeout(async () => {
                    // merges chunks and deletes from GCP
                    await combineMultiGCP(
                        previousTransfer.multiFileCollections
                    );
                }, extraWait);

                setTimeout(() => {
                    res.status(200).json({
                        msg: "ETL Successful",
                    });
                }, previousTransfer.qty * 200 + 1200);
                
            } catch (err) {
                console.log("etl combine error", err);
                res.status(500).json({
                    message: "There was an error with combining ETL",
                    error: err,
                });
            }
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

router.delete("/", async (req, res) => {
    try {
        await combineMultiGCP();
        res.status(200).json({
            message: "ETL Combination and removal of chunks successful",
        });
    } catch (err) {
        console.log("etl combine error", err);
        res.status(500).json({
            message: "There was an error with combining ETL",
            error: err,
        });
    }
});

module.exports = router;
