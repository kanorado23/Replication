// setup
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

// gcp creds/connection info
const username = process.env.MDB_USERNAME;
const pwd = process.env.MDB_PWD;
const databaseName = process.env.MDB_DATABASE_NAME;

const connectionURL = `mongodb+srv://${username}:${pwd}@stillwatercluster.bh9wd.gcp.mongodb.net/${databaseName}?retryWrites=true&w=majority`;

// retrieve and return collection names from MongoDB
async function getCollectionNames() {
    const client = new MongoClient(connectionURL, { useUnifiedTopology: true });

    try {
        await client.connect();
        const data = await client.db(databaseName).listCollections().toArray();
        const collectionsArr = [];
        data.forEach((collection) => {
            collectionsArr.push({ collectionName: collection.name });
        });
        return collectionsArr;
    } catch (error) {
        console.log("collection names retrieval error", error);
        throw error
    } finally {
        await client.close();
    }
}

module.exports = { getCollectionNames };
