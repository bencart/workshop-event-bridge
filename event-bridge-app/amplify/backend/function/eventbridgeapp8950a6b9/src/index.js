const EventBridgeClient = require("@aws-sdk/client-eventbridge").EventBridgeClient
const PutEventsCommand = require("@aws-sdk/client-eventbridge").PutEventsCommand
const ksuid = require("ksuid")
const ebClient = new EventBridgeClient({ region: process.env.REGION });

// Set the parameters.
const ENVELOPE = {
   Entries: []
}
const ENTRY  = {
   Detail: "",
   DetailType: "p33.produced.event",
   Source: "p33.producer"
}
const DETAIL = {
   evnt: "",
   food: "",
   animal: "",
   colour: ""
}

const food = ["donut","pizza","hamburger","spaghetti","candy","wine","boost juice","steak","ice cream","sandwich"]
const colour = ["red", "green", "blue", "orange", "aqua", "yellow", "pink", "black", "white", "grey"]
const animal = ["dog", "cat", "goat", "donkey", "llama", "horse", "camel", "monkey", "dolphin", "unicorn"]

/**
* @type {import('@types/aws-lambda').APIGatewayProxyHandler}
*/
exports.handler = async (event) => {
   const entries = []
   for (let i = 0; i < 6; i++) {
       let foodIndex = Math.random() * 10
       let colourIndex = Math.random() * 10
       let animalIndex = Math.random() * 10
       let event = {...DETAIL}
       event.animal = animal[animalIndex]
       event.colour = colour[colourIndex]
       event.food = food[foodIndex]
       id = await ksuid.random()
       event.evnt = id.string
       entries.push(event)
   }
   for (const event of entries) {
       let entry = {...ENTRY}
       entry.Detail = JSON.stringify(event)
       let envelope = {...ENVELOPE}
       envelope.Entries = [entry]
       await ebClient.send(new PutEventsCommand(envelope));
   }

   console.log(`EVENT: ${JSON.stringify(event)}`);
   return {
       statusCode: 200
   };
};
