"use strict";
const chatMessages = document.getElementById("chat-list");

var socket = io();
let even = true;

$(() => {
  if (localStorage.getItem("ackChatUserId") !== null) {
    $("#chat-section").toggleClass("hide");
    $("#chat-bar-container").toggleClass("hide");
    $("#username-form").toggleClass("hide");
    $("#message").focus();
  } else {
    $("#username").focus();
  }

  // populate messages
  socket.on("messages", (messages) => {
    $("#chat-list").empty();
    messages.forEach((message) => {
      if (message.username === localStorage.getItem("ackChatUsername")) {
        addChat(
          `${message.username}: ${message.message} - ${message.time}`,
          "right"
        );
      } else {
        addChat(
          `${message.time} - ${message.username}: ${message.message}`,
          "left"
        );
      }
    });
  });
});

// send user data from local storage
socket.on("get-user-data", () => {
  if (
    localStorage.getItem("ackChatUserId") !== null &&
    localStorage.getItem("ackChatUsername") !== null
  ) {
    socket.emit("send-user-data", {
      id: localStorage.getItem("ackChatUserId"),
      name: localStorage.getItem("ackChatUsername"),
    });
  }
});

// store user data in local storage
socket.on("set-user-data", (data) => {
  localStorage.setItem("ackChatUserId", data.id);
  localStorage.setItem("ackChatUsername", data.name);
});

// event listener for login form
$("#login").submit((e) => {
  e.preventDefault();
  localStorage.setItem("ackChatUsername", $("#username").val());
  socket.emit("validate-username", $("#username").val());
});

socket.on("validate-username", (validation) => {
  if (validation === null) {
    $("#username-alert").addClass("hide");
    $("#username").removeClass("border-danger");
    $("#chat-section").removeClass("hide");
    $("#chat-bar-container").removeClass("hide");
    $("#username-form").addClass("hide");
    $("#username-form").addClass("mt-4");
    socket.emit("new-user", localStorage.getItem("ackChatUsername"));
    $("#message").focus();
  } else {
    const username = $("#username").val();
    $("#username").addClass("border-danger");
    $("#username-alert").text(`${username} already taken!`);
    $("#username-alert").removeClass("hide");
    $("#username-form").removeClass("mt-4");
  }
  return false;
});

// add username message to chat list
socket.on("new-user", (name, time) => {
  if (name === localStorage.getItem("ackChatUsername")) {
    addChat(`${name} joined the chat - ${time}`, "right");
  } else {
    addChat(`${time} - ${name} joined the chat`, "left");
  }
});

// update user list
socket.on("user-list", (users) => {
  $("#users-list").empty();
  users.forEach((user) => {
    $("#users-list").append($("<li>").text(user.name).addClass("p-2"));
  });
});

$("#chat-bar").submit((e) => {
  e.preventDefault();
  socket.emit("message", {
    message: $("#message").val(),
  });
  $("#message").val("");
  $("#message").focus();
  return false;
});

$("#message").keypress(function () {
  socket.emit("typing", localStorage.getItem("ackChatUsername"));
});

//listen for typing event
socket.on("is typing", function (data) {
  document.querySelector("#typing-output").textContent = `${data} is typing`;
});

socket.on("message", (msg) => {
  if (msg.username === localStorage.getItem("ackChatUsername")) {
    addChat(`${msg.username}: ${msg.message} - ${msg.time}`, "right");
  } else {
    addChat(`${msg.time} - ${msg.username}: ${msg.message}`, "left");
  }
  document.querySelector("#typing-output").innerHTML = "";
});

// send message when user leaves
socket.on("user-left", (name) => {
  addChat(`${name.time} - ${name.name} has left the chat`, "left");
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
