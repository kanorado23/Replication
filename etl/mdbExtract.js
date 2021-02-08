// setup
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

// gcp creds/connection info
const username = process.env.MDB_USERNAME;
const pwd = process.env.MDB_PWD;
const databaseName = process.env.MDB_DATABASE_NAME;

const connectionURL = `mongodb+srv://${username}:${pwd}@stillwatercluster.bh9wd.gcp.mongodb.net/${databaseName}?retryWrites=true&w=majority`;

// retrieve and return collection from MongoDB
async function retrieveCollection(query, collectionName) {
    const client = new MongoClient(connectionURL, { useUnifiedTopology: true });

    try {
        await client.connect();
        const data = await client
            .db(databaseName)
            .collection(collectionName)
            .find(query)
            // .limit(3)
            .toArray();
        //   console.log("data from retrieveCollection", data);
        return data;
    } catch (error) {
        console.log("retrieveCollection error", error);
    } finally {
        await client.close();
    }
}

module.exports = { retrieveCollection };
