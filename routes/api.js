const express = require('express');
const router = express.Router(); 
const {functionName2} = require('../classes/db')
const {functionName} = require('../classes/writeToGCP')


router.get('/customers', getCustomers);


async function getCustomers(req, res, next){
    res.json({message: 'handleGet'});
    functionName(); 
}

module.exports = router;