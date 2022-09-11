/* src/App.js */
import React, { useEffect, useState } from 'react'
import { Amplify, API, graphqlOperation } from 'aws-amplify'
import { createMessage } from './graphql/mutations'
import { listMessages } from './graphql/queries'
import { onCreateMessage } from './graphql/subscriptions'

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const flattenEvents = function(newEvent, currentEvents) {
  var events = {...currentEvents}
  if (newEvent.evnt in events) {
    events[newEvent.evnt].people.push({name: newEvent.name, emoji: newEvent.emoji})
  } else {
    let e = {...newEvent}
    e.people = []
    e.people.push({name: newEvent.name, emoji: newEvent.emoji})
    events[newEvent.evnt] = e
  }
  return events
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
      const newMessages = flattenEvents(messageData.data.listMessages.items, messages)
      setMessages(newMessages)
    } catch (err) { console.log('error fetching messages') }
  }

  async function addMessage() {
    try {
      const message = {
        evnt : "123458",
        name : "BenC",
        emoji : "🦸🏻‍♂️",
        food : "Hamburger",
        colour : "Blue",
        animal : "Dog"
      }
      await API.graphql(graphqlOperation(createMessage, {input: message}))
    } catch (err) {
      console.log('error creating message:', err)
    }
  }

  return (
    <div style={styles.container}>
      <h2>Event Bridge Messages</h2>
      <button style={styles.button} onClick={addMessage}>Create Message</button>
      {
        
        Object.values(messages).map((message, index) => (
          <div key={message.id ? message.id : index} style={styles.message}>
            <p style={styles.messageEvent}>{message.evnt}</p>
            <p style={styles.messageDescription}>{message.food}</p>
            <p style={styles.messageDescription}>{message.colour}</p>
            <p style={styles.messageDescription}>{message.animal}</p><br></br>
            {message.people.map((person, ind) => (
              <span title={person.name}>{person.emoji}</span>
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