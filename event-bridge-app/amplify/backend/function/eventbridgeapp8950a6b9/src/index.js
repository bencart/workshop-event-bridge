const EventBridgeClient = require("@aws-sdk/client-eventbridge").EventBridgeClient
const PutEventsCommand = require("@aws-sdk/client-eventbridge").PutEventsCommand
const ksuid = require("ksuid")
const ebClient = new EventBridgeClient({ region: process.env.REGION });


// Set the parameters.
const ENVELOPE = {
   Entries: []
}
const ENTRY  = {
   DetailType: "p33.produced.event",
   Source: "p33.producer"
}

/**
* @type {import('@types/aws-lambda').APIGatewayProxyHandler}
*/
exports.handler = async (event) => {
   const food = ["tacos","pizza","hamburger","spaghetti","candy","donut","juice","steak","ice cream","sandwich"]
   const colour = ["red", "green", "blue", "orange", "aqua", "yellow", "pink", "black", "white", "grey"]
   const animal = ["dog", "cat", "goat", "donkey", "llama", "horse", "camel", "monkey", "dolphin", "unicorn"]
   const entries = []
   let foodIndex = Math.round(Math.random() * food.length)
   let colourIndex = Math.round(Math.random() * colour.length)
   let animalIndex = Math.round(Math.random() * animal.length)
   let startTime = new Date().getTime()
   for (let i = 0; i < 6; i++) {
       startTime++
       foodIndex = ++foodIndex % food.length
       colourIndex = ++colourIndex % colour.length
       animalIndex = ++animalIndex % animal.length
       
       let id = await ksuid.random()
              
       let entry = {
        "evnt": new Date(startTime).toISOString(),
        "animal": animal[animalIndex],
        "food": food[foodIndex],
        "colour": colour[colourIndex]
       }
       entries.push(entry)
       console.log(JSON.stringify(entry))
   }
   for (const ntry of entries) {
       let entry = {...ENTRY}
       entry.Detail = JSON.stringify(ntry)
       let envelope = {...ENVELOPE}
       envelope.Entries = [entry]
       await ebClient.send(new PutEventsCommand(envelope));
   }
   return {
       statusCode: 200
   };
};
