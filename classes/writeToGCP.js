const  {writeProducts} = require('./products');
const  {writeProductAvail} = require('./productAvailability');
const json2csvParser = require('json2csv').Parser; 
const fs = require("fs");
const path = require("path");
const {Storage} = require('@google-cloud/storage');
const { productAvailability } = require('./db');


/*  to do update the creds with GCP creds & Project Name
const storage = new Storage({
    keyFilename: path.join(__dirname, "../prodCreds.json"), 
    projectId: ''
}); */


//explicitly set the file type to csv to do get this set 

const metadata = {
    sourceFormat: 'CSV',
    skipLeadingRows: 1
}

async function writeToGCP() {
    //to do - right now this manually being done - iterate through and update collection to call the appropriate database to write the csv file
      await writeProducts(); 
      //await writeProductAvail(); 
      const bucketName = storage.bucket('replicaliper');

      //to do - right now manually updating the name of the file- similar to line 25 - make line 32 write file to the appropriate collection automatically
      const file = bucketName.file('product');
      //update file to JSON
      await fs.createReadStream('../tmp/products.csv')
        .pipe(file.createWriteStream())

        .on('error', function(err){
            console.log('error line 19 ' + err)
        
        .on('finish', function() {
                console.log('file upload complete')
            })
        })
}    
        
 
writeToGCP(); 