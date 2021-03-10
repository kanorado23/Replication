// setup/imports
const router = require("express").Router();
const { writeAll } = require("../etl/writeToGCP");
const { combineMultiGCP } = require("../etl/combineMultiGCP");
const { collectionsInfo } = require("../collections/collectionsInfo");
const { getCollectionNames } = require("../collections/retrievedCollections");

// handles /api/etl get requests
router.get("/", async (req, res) => {
    // const collections = collectionsInfo();
    const collections = await getCollectionNames();

    try {
        await writeAll(collections);

        res.status(200).json({
            message: "ETL successful",
        });
    } catch (err) {
        console.log("etl get error", err);
        res.status(500).json({
            message: "There was an error with ETL",
            error: err,
        });
    }
});

router.get("/combine", async (req, res) => {
    try {
        await combineMultiGCP();
        res.status(200).json({
            message: "ETL Combination successful",
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
