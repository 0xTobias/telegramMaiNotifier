const Web3 = require("web3");
var TelegramBot = require("telegrambot");
var express = require("express");
require("dotenv").config();

// ENTER A VALID RPC URL!
const web3 = new Web3("https://rpc.ftm.tools/");

var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var http = require("http").Server(app);

const BOT_API = process.env.BOT_API;
var api = new TelegramBot(BOT_API);

const chats = process.env.CHAT_IDS.split(":")

//ENTER SMART CONTRACT ADDRESS BELOW. see abi.js if you want to modify the abi
const CONTRACT_ADDRESS = "0x682E473FcA490B0adFA7EfE94083C1E63f28F034";
const MAI_CONTRACT_ADDRESS = "0xfb98b335551a418cd0737375a2ea0ded62ea213b";
const CONTRACT_ABI = require("./abi.json");
const MAI_CONTRACT_ABI = require("./mimaticAbi.json");
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
const maiContract = new web3.eth.Contract(
  MAI_CONTRACT_ABI,
  MAI_CONTRACT_ADDRESS
);

app.get("/", function (req, res) {
  res.send("OK");
});

var port = process.env.PORT || 3000;
http.listen(port, function () {
  console.log("listening on *:" + port);
});

async function sendMessage(message) {
  // The chat_id received in the message update
  chats.forEach(id => {
    let data = { chat_id: id, text: message };
    api.invoke("sendMessage", data, function (err, mess) {
      if (err) throw err;
    });
  })
}

async function getEvents() {
  let latest_block = await web3.eth.getBlockNumber();
  let historical_block = latest_block - 100; // you can also change the value to 'latest' if you have a upgraded rpc
  const message = "latest: " + latest_block + " historical block: " + historical_block;
  console.log(message);
  const events = await contract.getPastEvents(
    "PayBackToken", // change if your looking for a different event
    { fromBlock: historical_block, toBlock: "latest" }
  );
  await getTransferDetails(events);
}

async function checkMaiBalance() {
   const balance = await maiContract.methods.balanceOf(CONTRACT_ADDRESS).call();
   const balanceParsed = balance / 1.0e18;
   console.log(balanceParsed);
   if(balanceParsed > 2) {
     console.log("Notifying with a balance of " + balanceParsed)
     sendMessage("MAI availabasdfasfafasdfasdfasfafle for mint on yvDAI vault: " + balanceParsed)
   }
}

async function getTransferDetails(data_events) {
  for (i = 0; i < data_events.length; i++) {
    let amount = data_events[i]["returnValues"]["amount"];
    let amountParsed = amount/1.0e18;
    const message = "Someone returned their MAI to the yvDAI pool: " + amountParsed;
    sendMessage(message);
  }
}

checkMaiBalance();
getEvents(CONTRACT_ABI, CONTRACT_ADDRESS);
const interval = setInterval(function () {
  checkMaiBalance();
  getEvents(CONTRACT_ABI, CONTRACT_ADDRESS);
}, 60000);

