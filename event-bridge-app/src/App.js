/* src/App.js */
import React, { useEffect, useState } from 'react'
import { Amplify, API, graphqlOperation } from 'aws-amplify'
import { listMessages } from './graphql/queries'
import { onCreateMessage } from './graphql/subscriptions'

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const flattenEvents = function(newEvent, currentEvents) {
  var events = {...currentEvents}
  upsertEvent(newEvent, events)
  return orderEvents(events)
}

const refreshEvents = function(newEvents) {
  console.log(newEvents)
  var events = {}
  for (var newEvent of newEvents) {
    upsertEvent(newEvent, events)
  }
  return orderEvents(events)
}

const orderEvents = function(events) {
  var result = {}
  var keys = Object.keys(events)
  keys.sort()
  keys.reverse()
  for (var key of keys) {
    result[key] = events[key]
  }
  return result
}

const upsertEvent = function(evnt, evnts) {
  if (evnt.evnt in evnts) {
    evnts[evnt.evnt].people.push({name: evnt.name, emoji: evnt.emoji, key: evnt.id})
  } else {
    let e = {...evnt}
    e.people = []
    e.people.push({name: evnt.name, emoji: evnt.emoji, key: evnt.id})
    evnts[evnt.evnt] = e
  }
}

const App = () => {
  const [messages, setMessages] = useState({})

  useEffect(() => {
    const subscription = API.graphql({
        query: onCreateMessage,
    }).subscribe({
        next: ({ provider, value }) => {
            setMessages(flattenEvents(value.data.onCreateMessage, {...messages}))
        }
    })

    return () => {
        subscription.unsubscribe()
    }})

  async function fetchMessages() {
    try {
      const messageData = await API.graphql(graphqlOperation(listMessages))
      const newMessages = refreshEvents(messageData.data.listMessages.items)
      console.log(newMessages)
      setMessages(newMessages)
    } catch (err) { console.log('error fetching messages') }
  }

  return (
    <div style={styles.container}>
      <h2>Event Bridge Messages</h2>
      <button style={styles.button} onClick={fetchMessages}>Refresh Messages</button>
      {
        Object.values(messages).map((message, index) => (
          <div key={message.id ? message.id : index} style={styles.message}>
            <p style={styles.messageEvent}>{message.evnt}</p>
            <p style={styles.messageDescription}>{message.food}</p>
            <p style={styles.messageDescription}>{message.colour}</p>
            <p style={styles.messageDescription}>{message.animal}</p><br></br>
            {message.people.map((person, ind) => (
              <span key={person.key} title={person.name}>{person.emoji}</span>
            ))}
            <hr></hr>
          </div>

        ))
      }
    </div>
  )
}

const styles = {
  container: { width: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  message: {  margin: 0 },
  messageEvent: { fontWeight: 'bold' },
  messageDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default App