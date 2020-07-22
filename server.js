"use strict";

var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const moment = require("moment");
const { time } = require("console");

require("dotenv").config();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("index");
});

var user = encodeURIComponent("myUserAdmin");
var password = encodeURIComponent("aabbcc");
var authMechanism = "DEFAULT";

// Connection URL
//const url = "mongodb://localhost:27017";
var f = require("util").format;
const url = f(
  "mongodb://%s:%s@localhost:27017/?authMechanism=%s",
  user,
  password,
  authMechanism
);
// Database Name
const dbName = "ackchat";

MongoClient.connect(url, { useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to Database");
    const db = client.db(dbName);
    const users = db.collection("users");

    io.on("connection", (socket) => {
      // send user list back to new user
      users
        .find()
        .toArray()
        .then((results) => {
          io.to(socket.id).emit("user-list", results);
        })
        .catch((error) => console.error(error));

      // message received
      socket.on("message", (msg) => {
        msg.username = socket.username;
        msg.time = moment().format("h:mm a");
        io.emit("message", msg);
      });

      // messasage is typing
      socket.on("typing", function (data) {
        socket.broadcast.emit("is typing", data);
      });

      // we have a new user
      socket.on("new-user", (username, time) => {
        socket.username = username;
        time = moment().format("h:mm a");
        // add user to db
        users
          .insertOne({
            id: socket.id,
            name: username,
          })
          .then((result) => {
            console.log(`${username} added to db`);
          })
          .catch((error) => console.error(error));
        io.emit("new-user", username, time);
        // send user list back to all users
        users
          .find()
          .toArray()
          .then((results) => {
            io.emit("user-list", results);
          })
          .catch((error) => console.error(error));
      });

      // a user has disconnected
      socket.on("disconnect", () => {
        users
          .findOne({ id: socket.id })
          .then((result) => {
            if (result.name != undefined) {
              result.time = moment().format("h:mm a");
              io.emit("user-left", result);
            }
          })
          .catch((error) => console.error(error));
        users
          .deleteMany({ id: socket.id })
          .then((result) => {})
          .catch((error) => console.error(error));
        // send user list back to all users
        users
          .find()
          .toArray()
          .then((results) => {
            io.emit("user-list", results);
          })
          .catch((error) => console.error(error));
      });
    });
  })
  .catch(console.error);

http.listen(3000, () => {
  console.log("listening on *:3000");
});
