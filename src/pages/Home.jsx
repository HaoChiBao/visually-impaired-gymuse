import './css/Home.css';
import { useState, useEffect } from 'react';

// components
import SpeechFooter from '../components/SpeechFooter';
import {SpeakerBubble, changeSpeakerBubble, pulseSpeakerBubble} from '../components/SpeakerBubble';

// functions
import generateResponse from '../functions/generateResponse'
import generateSpeech from '../functions/generateSpeech'

// sounds
import recognitionOnSound from '../audio/bellchime.mp3'
// import recognitionOffSound from '../audio/belloff.mp3'
import recognitionOffSound from '../audio/popup.mp3'

import System from '../auth/system'


const system = new System()

let speechOn = false
let isSpeaking = false
const keyword = 'bro'
const contentAdd = '\n Keep the response length short and but keep content integrity.'

const retryPhrase = `I didn\'t catch that. Remember to say "${keyword.toUpperCase()}" in your response.`

let loadUserData = false // check if user data has been loaded into the chathistory

let chatHistory = [
  {
    role: 'system',
    // content: 'You are a personal workout assistant. You are helping a user with their workout routine. You give unique and personalized advice to the user based on their needs and goals. You are also able to answer any questions the user may have about their workout routine.'
    content: 'You are a personal workout assistant'
  },
]

const Home = () => {
  const [speech, setSpeech] = useState('Press to talk...')
  const [transcript, setTranscript] = useState('what you say appears here...')
  

  // console.log(await generateResponse())
  
  let recognition = new window.webkitSpeechRecognition;
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  // const button = document.querySelector('button')

  const turnRecognitionOn = async () => {
      speechOn = true
      try {
          changeSpeakerBubble(false, true)
          pulseSpeakerBubble()
          recognition.start() 
      } catch (error) {
          console.error(error)
      }
  }

  const turnRecognitionOff = async () => {
      speechOn = false
      try {
          pulseSpeakerBubble()
          changeSpeakerBubble(false, false)
          recognition.stop()
          // await recognition.abort()// do not use await here because it will block the rest of the code
      } catch (error) {
          console.error(error)
      }
  }

  const toggleRecognition = () => {
      const audio = new Audio()
      if(speechOn) {
          turnRecognitionOff()
          audio.src = recognitionOffSound
      } else {
          turnRecognitionOn()
          audio.src = recognitionOnSound
      }
      audio.play()
  }

  let timeout = null
  recognition.onresult = function (event) {
    if(!isSpeaking){

      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      // console.log(transcript)
  
      changeSpeakerBubble(false, true)
      setTranscript(transcript)
      pulseSpeakerBubble()
      
      clearTimeout(timeout)
      timeout = setTimeout(async () => {
        console.log(transcript)
  
        if (transcript.toLowerCase().includes(keyword.toLowerCase())){
          
          // check if user is logged in
          if(system.user && !loadUserData){
            const promptUserData = `Here is some user data: \n name: ${system.data.details.name} \n height: ${system.data.details.height} \n age: ${system.data.details.age} \n weight: ${system.data.details.weight} \n BMI: ${system.data.details.BMI}`
            chatHistory.push({role: 'system', content: promptUserData})
            console.log(promptUserData)
            loadUserData = true
          }
  
          // add user input to chat history
          chatHistory.push({role: 'user', content: transcript + contentAdd})
          const [response, copyChatHistory] = await generateResponse(chatHistory)
          // console.log(response)
          
          // update chat history with response
          chatHistory = copyChatHistory
          console.log(chatHistory)
  
          setSpeech(response)
  
        } else {
          setSpeech(retryPhrase)
        }
  
      }, 500)
    }
  }

  recognition.onstart = () => {
    console.log('Speech recognition starting...')
    changeSpeakerBubble(false, true)
    speechOn = true
}

  recognition.onend = async () => {     
    console.log('Speech recognition ending...')
    // if(speechOn) changeSpeakerBubble(false, true)
    // else 
    changeSpeakerBubble(false, false)
    speechOn = false
  }

  const speak = async () => {
    if(isSpeaking) return
    isSpeaking = true
    turnRecognitionOff()
    changeSpeakerBubble()
    
    await generateSpeech(speech)
    
    turnRecognitionOn()
    isSpeaking = false
  }

  const handleClick = async () => {
    toggleRecognition()
  }

  useEffect( () => {
    speak()
  },[speech])

  return (
    <div className = 'Home'>
        <button className="top" onClick={handleClick}>
            <SpeakerBubble/>
        </button>
      <div className="bottom">
          <p>{speech}</p>
      </div>
      <SpeechFooter speech = {transcript} />
    </div>
  );
}

export default Home;