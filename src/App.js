import './App.css';
import { useState, useEffect } from 'react';

import generateResponse from './functions/generateResponse'
import generateSpeech from './functions/generateSpeech'

import System from './auth/system'

const system = new System()

// system.signIn('test123@gmail.com', 'test123')

function App() {
  const [speech, setSpeech] = useState('Text Goes Here...')
  
  const main = async () => {
    const top_element = document.querySelector('.top')
    
    let speechOn = false
  
    const keyword = 'bro'
  
    // const contentAdd = '\n Keep the response short and simple.'
    const contentAdd = '\n Keep the response length short and but keep content integrity.'
    let chatHistory = [
      {
        role: 'system',
        // content: 'You are a personal workout assistant. You are helping a user with their workout routine. You give unique and personalized advice to the user based on their needs and goals. You are also able to answer any questions the user may have about their workout routine.'
        content: 'You are a personal workout assistant'
      },
    ]

    // console.log(await generateResponse())
    
    let recognition = new window.webkitSpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // const button = document.querySelector('button')

    const turnRecognitionOn = async (color = 'lightgreen') => {
      try {
        top_element.style.backgroundColor = color
        await recognition.start()
        setSpeech('Listening...')
        speechOn = true
      } catch (error) {
        console.log(error)
      }
    }
    
    const turnRecognitionOff = async (color = 'lavender') => {
      try {
        top_element.style.backgroundColor = color
        // await recognition.stop()
        await recognition.abort()
        setSpeech('Not Listening...')
        speechOn = false
      } catch (error) {
        console.log(error)
      }
    }

    top_element.addEventListener('click', async (e) => {
      e.preventDefault()
      if (!speechOn) await turnRecognitionOn()
      else await turnRecognitionOff()
    })

    let timeout = null
    recognition.onresult = function (event) {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;

      clearTimeout(timeout)
      timeout = setTimeout(async () => {
        console.log(transcript)

        if (transcript.toLowerCase().includes(keyword.toLowerCase())){
          
          await turnRecognitionOff('#ff7f7f')
          
          // add user input to chat history
          chatHistory.push({role: 'user', content: transcript + contentAdd})
          const [response, copyChatHistory] = await generateResponse(chatHistory)
          
          // update chat history with response
          chatHistory = copyChatHistory
          console.log(chatHistory)

          setSpeech(chatHistory[chatHistory.length - 1].content)

          // read out the response
          await generateSpeech(response)

          await turnRecognitionOn()

          setSpeech('Listening...')
        } else {
          setSpeech('I didn\'t catch that. Please try again.')
        }

      }, 500)
    }
  
    recognition.onend = async function (event) {        
      // console.log('Speech recognition has stopped...')
    }
  }

  useEffect(() => {
    main()
  },[])

  return (
    <div className = 'App'>
      <div className="top">
        <h2>
          {speech}
        </h2>
      </div>
      <div className="bottom">

      </div>
    </div>
  );
}

export default App;
