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

// use server available port or 3000
const PORT = process.env.PORT !== undefined ? process.env.PORT : 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("index");
});

// Connection URL
const db_url =
  process.env.MONGOLAB_URI !== undefined
    ? process.env.MONGOLAB_URI
    : "mongodb://localhost:27017";

// Database Name
const dbName =
  process.env.MONGOLAB_DBNAME !== undefined
    ? process.env.MONGOLAB_DBNAME
    : "ackchat";

MongoClient.connect(db_url, { useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to Database");
    const db = client.db(dbName);
    const users = db.collection("users");
    const messages = db.collection("messages");

    io.on("connection", (socket) => {
      // get user's data from local storage
      io.to(socket.id).emit("get-user-data");
      socket.on("send-user-data", (data) => {
        // set user to logged in
        users
          .findOneAndUpdate(
            { name: data.name },
            { $set: { loggedIn: true, id: socket.id } }
          )
          .then((result) => {
            io.to(socket.id).emit("set-user-data", result.value);
            // send out logged in users list
            users
              .find({ loggedIn: true })
              .toArray()
              .then((results) => {
                io.emit("user-list", results);
                io.emit("new-user", data.name, moment().format("h:mm a"));
              })
              .catch((error) => console.error(error));
          })
          .catch((error) => console.error(error));
      });

      messages
        .find()
        .toArray()
        .then((results) => {
          io.to(socket.id).emit("messages", results);
        })
        .catch((error) => console.error(error));

      // validate username
      socket.on("validate-username", (username) => {
        users.findOne({ name: username }).then((user) => {
          io.to(socket.id).emit("validate-username", user);
        });
      });

      // we have a new user
      socket.on("new-user", (username, time) => {
        socket.username = username;
        time = moment().format("h:mm a");
        users
          .insertOne({
            id: socket.id,
            name: username,
            loggedIn: true,
          })
          .then((result) => {
            io.to(socket.id).emit("set-user-data", {
              id: socket.id,
              name: username,
            });
            io.emit("new-user", username, time);
            // send user list back to all users
            users
              .find({ loggedIn: true })
              .toArray()
              .then((results) => {
                io.emit("user-list", results);
              })
              .catch((error) => console.error(error));
          })
          .catch((error) => console.error(error));
      });

      // message received
      socket.on("message", (msg) => {
        users
          .findOne({ id: socket.id })
          .then((result) => {
            if (result !== undefined) {
              msg.username = result.name;
              msg.time = moment().format("h:mm a");
              io.emit("message", msg);
              messages
                .insertOne({
                  message: msg.message,
                  username: msg.username,
                  time: msg.time,
                })
                .then((result) => {})
                .catch((error) => console.error(error));
            }
          })
          .catch((error) => console.error(error));
      });

      // messasage is typing
      socket.on("typing", function (data) {
        socket.broadcast.emit("is typing", data);
      });

      // a user has disconnected
      socket.on("disconnect", () => {
        users
          .findOneAndUpdate({ id: socket.id }, { $set: { loggedIn: false } })
          .then((result) => {
            const user = {
              id: result.value.id,
              name: result.value.name,
              time: moment().format("h:mm a"),
            };
            io.emit("user-left", user);
            users
              .find({ loggedIn: true })
              .toArray()
              .then((results) => {
                console.log(results);
                io.emit("user-list", results);
              })
              .catch((error) => console.error(error));
          })
          .catch((error) => console.error(error));
        // users
        //   .findOne({ id: socket.id })
        //   .then((result) => {
        //     console.log(result);
        //     if (result != undefined) {
        //       result.time = moment().format("h:mm a");
        //       io.emit("user-left", result);

        //     }
        //   })
        //   .catch((error) => console.error(error));
      });
    });
  })
  .catch(console.error);

http.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
