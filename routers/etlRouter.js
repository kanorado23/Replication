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
        const qty = await writeAll(collections);

        console.log(
            `... ...Waiting ${
                qty * 28 + 2
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
                    jsonlFiles.length == 0 ? 0 : jsonlFiles.length * 2000;

                console.log(
                    `... ... Waiting for an extra ${extraWait} ms for uploads to complete... ...`
                );
                setTimeout(async () => {
                    await combineMultiGCP();
                }, extraWait);

                // await combineMultiGCP();

                setTimeout(() => {
                    res.status(200).json({
                        msg: "ETL Successful",
                    });
                }, 1200);
            } catch (err) {
                console.log("etl combine error", err);
                res.status(500).json({
                    message: "There was an error with combining ETL",
                    error: err,
                });
            }
        }, qty * 28000 + 2000);
    } catch (err) {
        console.log("etl get error", err);
        res.status(500).json({
            message: "There was an error with ETL",
            error: err,
        });
    }
});

// merges chunks and deletes from GCP
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
