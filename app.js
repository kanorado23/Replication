// call server
const server = require("./api/server.js");

// creates port
const port = process.env.PORT || 5000;

// server listens
server.listen(port, () => {
    console.log(`\n *** server running on ${port}! *** \n`);
});
