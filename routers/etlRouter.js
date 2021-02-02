const router = require("express").Router();
const { writeAll } = require("../etl/writeToGCP");
const { collectionsInfo } = require("../collections/collectionsInfo");

router.get("/", async (req, res) => {
    const collections = collectionsInfo();

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

module.exports = router;
