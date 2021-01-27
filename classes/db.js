
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

/*to do update with credentials and collection
const username = 
const pwd = 
const databaseName = 

const connectionURL = ``

const collectionName1 = ''
const collectionName2 = ''
const collectionName3 = ''
*/

/* 
to do rather than doing the calls to each collection manually, refactor so it's one function calls each
collection name to iterate over the collection names
*/ 

async function productCollection(query) {
   return new Promise((resolve, reject) => {
     MongoClient.connect(connectionURL, {useUnifiedTopology: true}, async function(error, client) {
         if (error) {
            console.log(res, error, res.statusCode)
          } else {
          console.log('beginning wholesaleProducts');
          const db = client.db(databaseName)
          const salesInfo = await db.collection(collectionName1).find({}).toArray()
             .then((results ) => {
             resolve (results);
                })
            }
        }
   )}
)}

async function productAvailability(query) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(connectionURL, {useUnifiedTopology: true}, async function(error, client) {
          if (error) {
             console.log(res, error, res.statusCode)
           } else {
           console.log('beginning wholesaleProducts');
           const db = client.db(databaseName)
           const salesInfo = await db.collection(collectionName2).find({}).toArray()
              .then((results ) => {
              //console.log(results)
                resolve (results);
                 })
             }
         }
    )}
 )}


 async function customerCollection(query) {
    return new Promise((resolve, reject) => {
      MongoClient.connect(connectionURL, {useUnifiedTopology: true}, async function(error, client) {
          if (error) {
             console.log(res, error, res.statusCode)
           } else {
           console.log('beginning customers collection');
           const db = client.db(databaseName)
           const salesInfo = await db.collection(collectionName3).find({"ID": "8773b61d-2208-4871-966c-5f9b20afde1d"}).toArray()
              .then((results ) => {
              //console.log(results)
                resolve (results);
                 })
             }
         }
    )}
 )}


module.exports = {productCollection, productAvailability, customerCollection}; 


//productAvailability(); 