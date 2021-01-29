// imports
const { writeProducts } = require("../etl/products");
const { writeProductAvail } = require("../etl/productAvailability");

// Array of objects related to collections

const collections = [
    {
        collectionName: "products",
        collectionFunction: writeProducts,
    },
    {
        collectionName: "productAvailability",
        collectionFunction: writeProductAvail,
    },
];

const collectionsInfo = () => {
    return collections;
};

module.exports = { collectionsInfo };
