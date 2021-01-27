const json2Csv = require('json2csv').Parser;
const {productCollection } = require ('./db');
const fs = require('fs');


const headers = [
    {title: 'MongoID', key: '_id'},
    {title: 'ID', key: 'ID'},
    {title: 'AdditionalAttribute1', key: 'AdditionalAttribute1'},
    {title: 'AdditionalAttribute10', key: 'AdditionalAttribute10'},
    {title: 'AdditionalAttribute2', key: 'AdditionalAttribute2'},
    {title: 'AdditionalAttribute3', key: 'AdditionalAttribute3'},
    {title: 'AdditionalAttribute4', key: 'AdditionalAttribute4'},
    {title: 'AdditionalAttribute5', key: 'AdditionalAttribute5'},
    {title: 'AdditionalAttribute6', key: 'AdditionalAttribute6'},
    {title: 'AdditionalAttribute7', key: 'AdditionalAttribute7'},
    {title: 'AdditionalAttribute8', key: 'AdditionalAttribute8'},
    {title: 'AdditionalAttribute9', key: 'AdditionalAttribute9'},
    {title: 'AlwayShowQuantity', key: 'AlwayShowQuantity'},
    {title: 'AttributeSet', key: 'AttributeSet'},
    {title: 'AverageCost', key: 'AverageCost'},
    {title: 'Barcode', key: 'Barcode'},
    {title: 'Brand', key: 'Brand'},
    {title: 'COGSAccount', key: 'COGSAccount'},
    {title: 'Category', key: 'Category'},
    {title: 'CostingMethod', key: 'CostingMethod'},
    {title: 'DefaultLocation', key: 'DefaultLocation'},
    {title: 'Description', key: 'Description'},
    {title: 'DiscountRule', key: 'DiscountRule'},
    {title: 'DropShipMode', key: 'DropShipMode'},
    {title: 'ExpenseAccount', key: 'ExpenseAccount'},
    {title: 'Height', key: 'Height'},
    {title: 'InventoryAccount', key: 'InventoryAccount'},
    {title: 'LastModifiedOn', key: 'LastModifiedOn'},
    {title : 'Length', key: 'Length'},
    {title: 'MinimumBeforeReorder', key: 'MinimumBeforeReorder'},
    {title : 'Name', key: 'Name'},
    {title : 'PickZones', key: 'PickZones'},
    {title : 'PriceTier1', key: 'PriceTier1'},
    {title : 'PriceTier10', key: 'PriceTier10'},
    {title : 'PriceTier2', key: 'PriceTier2'},
    {title : 'PriceTier3', key: 'PriceTier3'},
    {title : 'PriceTier4', key: 'PriceTier4'},
    {title : 'PriceTier5', key: 'PriceTier5'},
    {title : 'PriceTier6', key: 'PriceTier6'},
    {title : 'PriceTier7', key: 'PriceTier7'},
    {title : 'PriceTier8', key: 'PriceTier8'},
    {title : 'PriceTier9', key: 'PriceTier9'},
    {title : 'Wholesaler -1', key: 'Wholesaler - 1'},
    {title : 'Retailer', key: 'Retailer -1'},
    {title : 'Distributor', key: 'Distributor - 1'},
    {title: 'PurchaseTaxRule', key: 'PurchaseTaxRule'},
    {title: 'ReorderQuantity', key: 'ReorderQuantity'},
    {title: 'RevenueAccount', key: 'RevenueAccount'},
    {title: 'SKU', key: 'SKU'},
    {title: 'SaleTaxRule', key: 'SaleTaxRule'},
    {title: 'Sellable', key: 'Sellable'},
    {title: 'Status', key: 'Status'},
    {title: 'StockLocator', key: 'StockLocator'},
    {title: 'Tags', key: 'Tags'},
    {title: 'Type', key: 'Type'},
    {title: 'UOM', key: 'UOM'},
    {title: 'Weight', key: 'Weight'},
    {title: 'Width', key: 'Width'}

];

// header row
const firstRow = headers.map( header => header.title );

async function writeProducts() {
    const buildSheet = await productCollection(); 

    const rows = buildSheet.map(row => {

        let keys = Object.keys(row);
        keys.forEach(key => {
            let val = row[key];
            if(key==='_id') {
                val = val.toString();
            }
            if(val && typeof val==='object'){
                const subKeys = Object.keys(val);
                subKeys.forEach(subKey => {
                    row[subKey] = val[subKey];
                });
                delete row[key];
            }
        });
        /// row is still an object - flattened

        // make it an array
        const rowArray = headers.map( header => {
            return row[ header.key ];
        } );

        return rowArray;
    });
//console.log('rows:', rows)
    

    rows.unshift(firstRow);

     const data = new json2Csv({header: false});
     const csvData = data.parse(rows);
//update file output
     fs.writeFile('../tmp/products.csv', csvData, function(error) {
         if (error) {
             console.log('error in writing products file', error);
        } else {
             console.log('products file created')
         }
     })
} 


module.exports = {writeProducts}