"use strict";

var socket = io();

$("#chat-bar").submit((e) => {
  e.preventDefault();
  socket.emit("message", $("#message").val());
  $("#message").val("");
  return false;
});

socket.on("message", (msg) => {
  console.log(`message: ${msg}`);
  $("#chat-list").append($("<li>").text(msg));
});
