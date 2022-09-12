/* Amplify Params - DO NOT EDIT
	API_EVENTBRIDGEAPP_GRAPHQLAPIENDPOINTOUTPUT
	API_EVENTBRIDGEAPP_GRAPHQLAPIIDOUTPUT
	API_EVENTBRIDGEAPP_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

 const AWS = require('aws-sdk')
 const urlParse = require('url').URL
 const fetch = require('node-fetch')
 const createMessage = require('./graphql/mutations').createMessage

exports.handler = async (event) => {
    const appsyncUrl = process.env.API_EVENTBRIDGEAPP_GRAPHQLAPIENDPOINTOUTPUT
    const region = process.env.REGION
    const apiKey = process.env.API_EVENTBRIDGEAPP_GRAPHQLAPIKEYOUTPUT

    //same as appsyncUrl but without the "https://"
    const endpoint = new urlParse(appsyncUrl).hostname
    const httpRequest = new AWS.HttpRequest(appsyncUrl, region)

    httpRequest.headers.host = endpoint
    httpRequest.headers['Content-Type'] = 'application/json'
    httpRequest.headers['x-api-key'] = apiKey
    httpRequest.method = 'POST'

    //request to update an order with AppSync start
    const createNewMessage = (eventBody) => {
        const createMessageBody = {
            query: createMessage,
            operationName: 'CreateMessage',
            variables: {
                input: eventBody,
            },
        }

        httpRequest.body = JSON.stringify(createMessageBody)

        const options = {
            method: httpRequest.method,
            body: httpRequest.body,
            headers: httpRequest.headers,
        }
        return fetch(appsyncUrl, options).then((res) => res.json())
    } //request to update an order with AppSync end

    //make the call to update an order, sending the updated order back to the client
    try {
        const createdMessage = await createNewMessage({
            evnt : event.detail.evnt,
            name : event.detail.person,
            emoji : event.detail.emoji,
            food : event.detail.food,
            colour : event.detail.colour,
            animal : event.detail.animal
          })

        return {
            statusCode: 200
        }
    } catch (e) {
        console.log({ error: e })
        return { statusCode: 404, body: { error: e } }
    }
};
