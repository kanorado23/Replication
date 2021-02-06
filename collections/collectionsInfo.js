const collections = [
    {
        collectionName: process.env.MDB_PRODUCTCS_COLLECTION_NAME,
        query: {},
    },
    {
        collectionName: process.env.MDB_PRODUCT_AVAILABILITY_COLLECTION_NAME,
        query: {},
    },
    {
        collectionName: process.env.MDB_SALES_COLLECTION_NAME,
        query: {},
    },
];

const collectionsInfo = () => {
    return collections;
};

module.exports = { collectionsInfo };
