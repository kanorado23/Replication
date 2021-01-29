const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const path = require("path");
require("dotenv").config({ path: "../.env" });

// to do update with credentials and collection
// Complete -- AMR

const username = process.env.MDB_USERNAME;
const pwd = process.env.MDB_PWD;
const databaseName = process.env.MDB_DATABASE_NAME;

const connectionURL = `mongodb+srv://${username}:${pwd}@stillwatercluster.bh9wd.gcp.mongodb.net/${databaseName}?retryWrites=true&w=majority`;

// to do rather than doing the calls to each collection manually, refactor so it's one function calls each
// collection name to iterate over the collection names
// Complete -- AMR

// async function retrieveCollection(query, collectionName) {
//     return new Promise((resolve, reject) => {
//         MongoClient.connect(
//             connectionURL,
//             { useUnifiedTopology: true },
//             async function (error, client) {
//                 if (error) {
//                     console.log(resolve, error, resolve.statusCode);
//                 } else {
//                     console.log("beginning wholesaleProducts");
//                     const db = client.db(databaseName);
//                     const salesInfo = await db
//                         .collection(collectionName)
//                         .find({ limit: 3 });
//                     // .toArray()
//                     // .then((results) => {
//                     //     console.log("retrieveCollection result", results);
//                     //     resolve(results);
//                     // });
//                     console.log("sales info", salesInfo);
//                 }
//             }
//         );
//     });
// };

async function retrieveCollection(query, collectionName) {
    const client = new MongoClient(connectionURL, { useUnifiedTopology: true });

    try {
        await client.connect();
        const data = await client
            .db(databaseName)
            .collection(collectionName)
            .find(query)
            .limit(3)
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
