import './App.css';
import { useState } from 'react';

import { GOOGLE_TTS_KEY, OPENAI_API_KEY } from './API_KEYS.js'



function App() {
  const [speech, setSpeech] = useState('Text Goes Here...')
  let speechOn = false

  const keyword = 'bro'

  const contentAdd = '\n Keep the response short and simple.'
  let chatHistory = [
    {
      role: 'system',
      // content: 'You are a personal workout assistant. You are helping a user with their workout routine. You give unique and personalized advice to the user based on their needs and goals. You are also able to answer any questions the user may have about their workout routine.'
      content: 'You are a personal workout assistant'
    },
  ]
  
  const main = async () => {

    let audio = new Audio();

    const generateSpeech = async (text) => {
      return new Promise(async (resolve, reject) => {
        
        audio.pause();
        // const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${projectId}`;
        const apiUrl = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${GOOGLE_TTS_KEY}`;
        
        const requestBody = JSON.stringify({
          input: { text: text },
    
          voice: { 
            languageCode: 'en-US', 
            name: "en-US-Studio-O"
          },
    
          audioConfig: { 
            audioEncoding: 'LINEAR16', 
            // effectsProfileId: ['small-bluetooth-speaker-class-device'],
            pitch: 0,
            speakingRate: 1
          },
        });
      
        try {
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: requestBody,
          });
      
          if (!response.ok) {
            throw new Error(`Failed to generate speech. Status: ${response.status}`);
          }
      
          const data = await response.json();
          const audioContent = data.audioContent;
          
          // Handle the audio content as needed (e.g., play it, save it to a file, etc.)
          // console.log('Speech generated:', audioContent);
  
          audio.src = `data:audio/wav;base64,${audioContent}`;
          await audio.play();

          audio.onended = () => {
            resolve()
          }
  
        } catch (err) {
          console.error('Error generating speech:', err.message || err);
          resolve()
        }

      })
    }

    const generateResponse = async (text) => {
      const copyChatHistory = [...chatHistory]
      copyChatHistory.push({role: 'user', content: text + contentAdd})

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`,

          },
          body: JSON.stringify({
              model: 'gpt-4',
              messages: copyChatHistory,
              max_tokens: 100,
              temperature: 0.2,
              // stop: ['\n', 'User:', 'Assistant:'],
          })
      })
      if (!response.ok) {
        throw new Error(`Failed to generate response. Status: ${response.status}`);
      }
      const data = await response.json();
      const content = data.choices[0].message.content
      copyChatHistory.push({role: 'system', content})
      chatHistory = copyChatHistory
      return content
    }

    // console.log(await generateResponse())
    
    let recognition = new window.webkitSpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // const button = document.querySelector('button')

    const turnRecognitionOn = async (color = 'lightgreen') => {
      try {
        const body = document.querySelector('body')
        body.style.backgroundColor = color
        await recognition.start()
        setSpeech('Listening...')
        speechOn = true
      } catch (error) {
        console.log(error)
      }
    }
    
    const turnRecognitionOff = async (color = 'lavender') => {
      try {
        const body = document.querySelector('body')
        body.style.backgroundColor = color
        // await recognition.stop()
        await recognition.abort()
        setSpeech('Not Listening...')
        speechOn = false
      } catch (error) {
        console.log(error)
      }
    }

    window.addEventListener('click', async () => {
      if (!speechOn) await turnRecognitionOn()
      else await turnRecognitionOff()
    })
    
    let timeout = null
    recognition.onresult = function (event) {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;

      clearTimeout(timeout)
      timeout = setTimeout(async () => {

        if (transcript.toLowerCase().includes(keyword.toLowerCase())){
          
          await turnRecognitionOff('#ff7f7f')
          
          const response = await generateResponse(transcript)
          console.log(chatHistory)

          setSpeech(chatHistory[chatHistory.length - 1].content)

          await generateSpeech(response)

          await turnRecognitionOn()

          setSpeech('Listening...')
        } else {
          setSpeech('I didn\'t catch that. Please try again.')
        }

      }, 500)
    }
  
    recognition.onend = async function (event) {        
      console.log('Speech recognition has stopped...')
    }
  }

  window.onload = async () => {
    await main()
  }

  return (
    <>
      <h2>
        {speech}
      </h2>
      {/* <button>press</button> */}
    </>
  );
}

export default App;
