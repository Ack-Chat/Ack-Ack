"use strict";

var socket = io();
let even = true;
let username = "";

$(() => {
  $("#username").focus();
});

$("#chat-bar").submit((e) => {
  e.preventDefault();
  socket.emit("message", {
    message: $("#message").val(),
  });
  // addChat(`${socket.nickname}: ${$("#message").val()}`);
  $("#message").val("");
  $("#message").focus();
  return false;
});

socket.on("message", (msg) => {
  if (msg.username === username) {
    addChat(`${msg.username}: ${msg.message}`, "right");
  } else {
    addChat(`${msg.username}: ${msg.message}`, "left");
  }
});

// event listener for username
$("#login").submit((e) => {
  e.preventDefault();
  username = $("#username").val();
  $("#username-form").toggleClass("hide");
  $("#chat-messages").toggleClass("hide");
  $("#chat-bar-container").toggleClass("hide");
  socket.emit("username", username);
  $("#message").focus();
  return false;
});

// add username message to chat list
socket.on("username", (name) => {
  if (name === username) {
    addChat(`${name} joined the chat`, "right");
  } else {
    addChat(`${name} joined the chat`, "left");
  }
});

function addChat(msg, orientation) {
  if (orientation === "right") {
    if (even) {
      $("#chat-list").append(
        $("<li>").text(msg).addClass("bg-white p-2 text-right")
      );
      even = !even;
    } else {
      $("#chat-list").append(
        $("<li>").text(msg).addClass("bg-light p-2 text-right")
      );
      even = !even;
    }
  } else {
    if (even) {
      $("#chat-list").append($("<li>").text(msg).addClass("bg-white p-2"));
      even = !even;
    } else {
      $("#chat-list").append($("<li>").text(msg).addClass("bg-light p-2"));
      even = !even;
    }
  }
}
