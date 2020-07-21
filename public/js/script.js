"use strict";
const chatMessages = document.getElementById("chat-messages");

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

$("#message").keypress(function () {
  socket.emit("typing", $("#username").val());
});

//listen for typing event
socket.on("is typing", function (data) {
  console.log(data);
  document.querySelector("#typing-output").innerHTML = `${data} is typing`;
});

socket.on("message", (msg) => {
  if (msg.username === username) {
    addChat(`${msg.username}: ${msg.message}`, "right");
  } else {
    addChat(`${msg.username}: ${msg.message}`, "left");
  }
  document.querySelector("#typing-output").innerHTML = "";
});

// event listener for login form
$("#login").submit((e) => {
  e.preventDefault();
  username = $("#username").val();
  $("#chat-section").toggleClass("hide");
  $("#chat-bar-container").toggleClass("hide");
  $("#username-form").toggleClass("hide");
  socket.emit("new-user", username);
  $("#message").focus();
  return false;
});

// add username message to chat list
socket.on("new-user", (name) => {
  $("#users-list").append($("<li>").text(name));
  if (name === username) {
    addChat(`${name} joined the chat`, "right");
  } else {
    addChat(`${name} joined the chat`, "left");
  }
});

// update user list
socket.on("user-list", (users) => {
  $("#users-list").empty();
  users.forEach((user) => {
    $("#users-list").append($("<li>").text(user.name).addClass("p-2"));
  });
});

// send message when user leaves
socket.on("user-left", (name) => {
  addChat(`${name} has left the chat`, "left");
});

function addChat(msg, orientation) {
  if (orientation === "right") {
    if (even) {
      $("#chat-list").append(
        $("<li>").text(msg).addClass("bg-white p-2 text-right")
      );
      chatMessages.scrollTop = chatMessages.scrollHeight;
      even = !even;
    } else {
      $("#chat-list").append(
        $("<li>").text(msg).addClass("bg-light p-2 text-right")
      );
      chatMessages.scrollTop = chatMessages.scrollHeight;
      even = !even;
    }
  } else {
    if (even) {
      $("#chat-list").append($("<li>").text(msg).addClass("bg-white p-2"));
      chatMessages.scrollTop = chatMessages.scrollHeight;
      even = !even;
    } else {
      $("#chat-list").append($("<li>").text(msg).addClass("bg-light p-2"));
      chatMessages.scrollTop = chatMessages.scrollHeight;
      even = !even;
    }
  }
}
