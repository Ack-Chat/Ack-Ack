var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("login");
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("message", (msg) => {
    console.log("message: " + msg);
    io.emit("message", msg);
  });
  socket.on("username", (username) => {
    console.log("username: " + username);
    socket.broadcast.emit("username", username);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
