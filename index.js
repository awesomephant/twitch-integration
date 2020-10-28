require("dotenv").config();
const messages = require("./.data/messages.json");
const express = require("express");
const app = express();
const server = require("http").createServer(app);
const port = 3000;
const options = {};
const io = require("socket.io")(server, options);
const tmi = require("tmi.js");
const fs = require("fs");

function initBot() {
  const settings = {
    identity: {
      username: process.env.BOT_USERNAME,
      password: process.env.TWITCH_OAUTH,
    },
    channels: [process.env.CHANNEL_NAME],
  };
  const client = new tmi.client(settings);
  client.on("message", handleMessage);
  client.on("connected", handleConnect);
  client.connect();
}

io.on("connection", (socket) => {
  console.log("Client connected.");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.use(express.static("public"));
app.use(express.static(".data"));

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

app.get("/messages", (req, res) => {
  res.json(messages.data);
});

server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
  console.log(`Connecting to Twitch...`);
  initBot();
});

function handleMessage(target, context, msg, self) {
  if (self) {
    return;
  }
  const now = new Date().toISOString();
  // Let's make a nice message object
  const message = {
    text: msg,
    id: context.id,
    username: context.username,
    displayName: context["display-name"],
    userID: context["user-id"],
    colour: context.color,
    timestamp: now,
  };
  messages.data.push(message);
  messages.lastUpdated = now;
  
  // We'll only cache the 150 most recent messages
  if (messages.length > 150) {
    messages.shift();
  }
  fs.writeFileSync(
    "./.data/messages.json",
    JSON.stringify(messages, null, "  ")
  );
  io.emit("message", message);
}

function handleConnect(addr, port) {
  console.log(`* Connected to Twitch at ${addr}:${port}`);
}
