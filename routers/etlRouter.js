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

    try {
        console.log("---     Start of Request     ---");
        let collections = await (await getCollectionNames()).filter(
            (collection) => {
                return name && collection.collectionName.toLowerCase().includes(name);
            }
        );

        if (collections.length === 0) {
            throw `${name} not found in Collections names`;
        } else {
            console.log("---     Transforming & Uploading Data     ---");
            const previousTransfer = await writeAll(collections);

            console.log(
                "---     Checking for & Combining Chunked Files     ---"
            );
            await combineMultiGCP(previousTransfer.multiFileCollections);

            console.log("---     End of request (SUCCESS)     ---");
            res.status(200).json({
                message: "ETL successful",
            });
        }
    } catch (err) {
        console.log("---     End of request (ERROR)     ---");
        console.log("etl error", err);
        res.status(500).json({
            message: "There was an error with etl",
            error: err,
        });
    }
});

module.exports = router;
