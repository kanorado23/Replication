const express = require("express");

// config for .env variables
require("dotenv").config({ path: "./.env" });

// server
const server = express();

// use json
server.use(express.json());

// call etlRouter for /api/etl requests
server.use("/api/etl", require("../routers/etlRouter"));

// test to check if server is running
server.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

module.exports = server;
