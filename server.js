var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var bodyParser = require("body-parser");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("index");
});

io.on("connection", (socket) => {
  socket.on("message", (msg) => {
    msg.username = socket.username;
    io.emit("message", msg);
  });
  socket.on("username", (username) => {
    socket.username = username;
    io.emit("username", username);
  });
  socket.on("disconnect", () => {});
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
