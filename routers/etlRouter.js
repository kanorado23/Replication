// setup/imports
const router = require("express").Router();
const { writeAll } = require("../etl/writeToGCP");
const { combineMultiGCP } = require("../etl/combineMultiGCP");
const { collectionsInfo } = require("../collections/collectionsInfo");
const { getCollectionNames } = require("../collections/retrievedCollections");

// handles /api/etl get requests
// gets ALL collections
router.get("/", async (req, res) => {
  try {
    console.log("\x1b[36m%s\x1b[0m", "---     Start of Request     ---");
    let collections = await getCollectionNames();

    console.log("---     Transforming & Uploading Data     ---");
    const previousTransfer = await writeAll(collections);

    if (previousTransfer.qty > 0) {
      console.log("---     Checking for & Combining Chunked Files     ---");
      await combineMultiGCP(previousTransfer.multiFileCollections);
    } else {
      console.log("---     No Chunked Files - Skipping Combine     ---");
    }
    console.log(
      "\x1b[32m%s\x1b[0m",
      "---     End of request (SUCCESS)     ---"
    );
    res.status(200).json({
      message: "ETL successful",
    });
  } catch (err) {
    console.log("\x1b[31m%s\x1b[0m", "---     End of request (ERROR)     ---");
    console.log("etl error", err);
    res.status(500).json({
      message: "There was an error with etl",
      error: err,
    });
  }
});

// accepts a param of 'name' to filter which collections are used
//     Ex: `/api/etl/woo`
router.get("/:name", async (req, res) => {
  const name = req.params.name.toLowerCase();
  console.log(name);

  try {
    console.log("\x1b[36m%s\x1b[0m", "---     Start of Request     ---");
    let collections = await getCollectionNames();

    collections = collections.filter((col) =>
      col.collectionName.toLowerCase().includes(name)
    );

    if (collections.length === 0) {
      throw `${name} not found in Collections names`;
    } else {
      console.log("---     Transforming & Uploading Data     ---");
      const previousTransfer = await writeAll(collections);

      if (previousTransfer.qty > 0) {
        console.log("---     Checking for & Combining Chunked Files     ---");
        await combineMultiGCP(previousTransfer.multiFileCollections);
      } else {
        console.log("---     No Chunked Files - Skipping Combine     ---");
      }
      console.log(
        "\x1b[32m%s\x1b[0m",
        "---     End of request (SUCCESS)     ---"
      );
      res.status(200).json({
        message: "ETL successful",
      });
    }
  } catch (err) {
    console.log("\x1b[31m%s\x1b[0m", "---     End of request (ERROR)     ---");
    console.log("etl error", err);
    res.status(500).json({
      message: "There was an error with etl",
      error: err,
    });
  }
});

module.exports = router;
