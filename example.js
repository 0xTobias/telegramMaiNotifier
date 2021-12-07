const Web3 = require("web3");
var TelegramBot = require("telegrambot");
require("dotenv").config();

// ENTER A VALID RPC URL!
const web3 = new Web3("https://rpc.ftm.tools/");

const BOT_API = process.env.BOT_API;
var api = new TelegramBot(BOT_API);

const chats = process.env.CHAT_IDS.split(":")

//ENTER SMART CONTRACT ADDRESS BELOW. see abi.js if you want to modify the abi
const CONTRACT_ADDRESS = "0x682e473fca490b0adfa7efe94083c1e63f28f034";
const CONTRACT_ABI = require("./abi.json");
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

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
  let historical_block = latest_block - 500; // you can also change the value to 'latest' if you have a upgraded rpc
  const message = "latest: " + latest_block + " historical block: " + historical_block;
  console.log(message);
  const events = await contract.getPastEvents(
    "PayBackToken", // change if your looking for a different event
    { fromBlock: historical_block, toBlock: "latest" }
  );
  await getTransferDetails(events);
}

async function getTransferDetails(data_events) {
  for (i = 0; i < data_events.length; i++) {
    let amount = data_events[i]["returnValues"]["amount"];
    let amountParsed = amount/1.0e18;
    const message = "Someone returned their MAI to the yvDAI pool: " + amountParsed;
    sendMessage(message);
  }
}

getEvents(CONTRACT_ABI, CONTRACT_ADDRESS);
const interval = setInterval(function () {
  getEvents(CONTRACT_ABI, CONTRACT_ADDRESS);
}, 300000);

