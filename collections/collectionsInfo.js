// imports
const { writeProducts } = require("../etl/products");
const { writeProductAvail } = require("../etl/productAvailability");

// Array of objects related to collections

const collections = [
    {
        collectionName: process.env.MDB_PRODUCTCS_COLLECTION_NAME,
        gcpBucket: process.env.GCP_PRODUCTS_BUCKET_NAME,
        collectionFunction: writeProducts,
        query: {},
    },
    {
        collectionName: process.env.MDB_PRODUCT_AVAILABILITY_COLLECTION_NAME,
        gcpBucket: process.env.GCP_PRODUCT_AVAILABILITY_BUCKET_NAME,
        collectionFunction: writeProductAvail,
        query: {},
    },
];

const collectionsInfo = () => {
    return collections;
};

module.exports = { collectionsInfo };
