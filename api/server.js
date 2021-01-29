const express = require("express");
const path = require("path");

require("dotenv").config({ path: "../.env" });

const etlRouter = require("../routers/etlRouter");

const server = express();

server.use(express.json());

server.use("/api/etl", etlRouter);

server.get("/", (req, res) => {
    res.status(200).json({ message: "Server is running" });
});

module.exports = server;
