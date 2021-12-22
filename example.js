const Web3 = require("web3");
var TelegramBot = require("telegrambot");
require("dotenv").config();

// ENTER A VALID RPC URL!
const web3 = new Web3("https://rpc.ftm.tools/");

const BOT_API = process.env.BOT_API;
var api = new TelegramBot(BOT_API);

const chats = process.env.CHAT_IDS.split(":");

//ENTER SMART CONTRACT ADDRESS BELOW. see abi.js if you want to modify the abi
const CONTRACT_ADDRESS = "0x682E473FcA490B0adFA7EfE94083C1E63f28F034";
const MAI_CONTRACT_ADDRESS = "0xfb98b335551a418cd0737375a2ea0ded62ea213b";
const MAI_CONTRACT_ABI = require("./mimaticAbi.json");
const maiContract = new web3.eth.Contract(
  MAI_CONTRACT_ABI,
  MAI_CONTRACT_ADDRESS
);

// const PORT = 3000;

// const { createServer } = require("http");

// const server = createServer((req, res) => {
//   res.send("Ok")
// });

// server.listen(PORT, () => {
//   console.log(`:: server listening on port: ${PORT}`);
// });

async function sendMessage(message) {
  // The chat_id received in the message update
  chats.forEach((id) => {
    let data = { chat_id: id, text: message };
    api.invoke("sendMessage", data, function (err, mess) {
      if (err) throw err;
    });
  });
}

async function checkMaiBalance() {
  const balance = await maiContract.methods.balanceOf(CONTRACT_ADDRESS).call();
  const balanceParsed = balance / 1.0e18;
  console.log(balanceParsed);
  if (balanceParsed > 50) {
    console.log("Notifying with a balance of " + balanceParsed);
    sendMessage("MAI available for mint on yvDAI vault: " + balanceParsed);
  }
}
  sendMessage("working!");

const express = require("express");
const app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var http = require("http").Server(app);

app.get("/", (req, res) => res.send("Home"));

var port = process.env.PORT || 3000;
http.listen(port, function () {
  checkMaiBalance();
  const interval = setInterval(function () {
    sendMessage("working!");
    checkMaiBalance();
  }, 60000);
  console.log("listening on *:" + port);
});