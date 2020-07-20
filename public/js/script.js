"use strict";

var socket = io();
let even = true;

$("#chat-bar").submit((e) => {
  e.preventDefault();
  socket.emit("message", $("#message").val());
  $("#message").val("");
  return false;
});

// socket.on("message", (msg) => {
//   console.log(`message: ${msg}`);
//   let li = $("<li>").text(val);
//   if (even) {
//     $("#chat-list").append($("<li>").text(msg).addClass("bg-white"));
//     even = !even;
//   } else {
//     $("#chat-list").append($("<li>").text(msg).addClass("bg-light"));
//     even = !even;
//   }
// });

socket.on("message", (msg) => {
  $("#chat-list").append($("<li>").text(msg));
});

// event listener for username
$("#login").submit((e) => {
  e.preventDefault();
  socket.emit("username", $("#username").val());
  return false;
});

// add username message to chat list
socket.on("username", (username) => {
  $("#chat-list").append($("<li>").text(`${username} joined the chat`));
});
