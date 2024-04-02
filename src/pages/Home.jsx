import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import SpeechFooter from '../components/SpeechFooter';
import { SpeakerBubble, changeSpeakerBubble, pulseSpeakerBubble } from '../components/SpeakerBubble';

import generateResponse from '../functions/generateResponse';
import generateSpeech from '../functions/generateSpeech';

import System from '../auth/system'

import onSound from '../audio/recognitionOn.mp3'
import offSound from '../audio/recognitionOff.mp3'

import './css/Home.css'

const audio = new Audio()

let chatHistory = [
  {
    role: 'system',
    // content: 'You are a personal workout assistant. You are helping a user with their workout routine. You give unique and personalized advice to the user based on their needs and goals. You are also able to answer any questions the user may have about their workout routine.'
    content: 'You are a personal workout assistant'
  },
]
const contentAdd = '\n Keep the response length short and but keep content integrity.'

const keyword = 'bro'
const retryPhrase = `I didn\'t catch that. Remember to say "${keyword.toUpperCase()}" in your response.`

const defaultResponsePhrase = 'press to talk...'
// const defaultResponsePhrase = 'Lorem Ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
const defaultTranscriptPhrase = 'user voice here...'

let loadUserData = false

let promptLogin = false

const system = new System()

const Home = () => {
  const [transcript, setTranscript] = useState(defaultTranscriptPhrase); // stores the text generated from STT
  const [botResponse, setBotResponse] = useState(defaultResponsePhrase)
  const [speakerState, setSpeakerState] = useState(0); // determines the state of the speaker bubble 

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [resetUserString, setResetUserString] = useState(false)
  const { finalTranscript, interimTranscript, resetTranscript, listening } = useSpeechRecognition();

  const [responseAudio, setResponseAudio] = useState(null)

  const [speechColour, setSpeechColour] = useState(0)
  const [responseColour, setResponseColour] = useState(0)

  const [contrast, setContrast] = useState(1)

  const [test, setTest] = useState('test')
  // executes when the final result occurs
  useEffect(() => {
    if (finalTranscript !== '') {
      console.log('Final result:', finalTranscript)
      // onFinalTranscript(finalTranscript);
      setTranscript(finalTranscript);
      resetTranscript();
      setResetUserString(true)
    }
  }, [finalTranscript, resetTranscript]);

  useEffect(()=>{
    if(interimTranscript != ''){
      if(resetUserString){
        setTranscript('')
        setResetUserString(false)
      }

      setTranscript(interimTranscript)
      pulseSpeakerBubble()
    }
  },[interimTranscript])

  useEffect(() => {
    if(botResponse != defaultResponsePhrase){
      setResponseColour(1)
      speak(botResponse)
    }
  },[botResponse])

  // useEffect(()=>{console.log(listening)},[listening])
  // 
  const onFinalTranscript = async (transcript) => {
    if(!promptLogin && !system.user){
      setBotResponse(`Hey! You're not logged in. Would you like to create a personalized account? If so say "GO TO REGISTER". If not ignore this message.`)
      promptLogin = true
      return
    }
    // console.log('Final result:', transcript);
    // console.log(isSpeaking)
    if((transcript.toLowerCase()).includes(keyword) && !isSpeaking){
      setSpeechColour(1) // indicates to user that the response is being processed
      setResponseColour(2)

      if(!loadUserData && system.user){
        const promptUserData = `Here is some user data: \n name: ${system.data.details.name} \n height: ${system.data.details.height} \n age: ${system.data.details.age} \n weight: ${system.data.details.weight} \n BMI: ${system.data.details.BMI}`
        chatHistory.push({role: 'system', content: promptUserData})
        console.log(promptUserData)
        loadUserData = true
      }

      chatHistory.push({role: 'user', content: transcript + contentAdd})
      const [response, copyChatHistory] = await generateResponse(chatHistory)
      chatHistory = copyChatHistory
      console.log(chatHistory)
      console.log(response)
      setBotResponse(response)
      setSpeechColour(0) // indicates to user that the response was processed
    } 
    else if ((transcript.toLowerCase()).includes('go to register')){
      setBotResponse(`Redirecting...`)
      window.location.pathname = '/register'
    } 
    else {
      setSpeechColour(2) // indicates to user that the response was not processed
    }
  };

  // start speech recognition
  const startListening = async () => {
    setSpeakerState(1)
    playAudio(onSound)
    if(!listening) await SpeechRecognition.startListening({ continuous: true });
  };
  
  // stop speech recognition
  const stopListening = async () => {
    setSpeakerState(0)
    playAudio(offSound)
    if(listening) await SpeechRecognition.stopListening();
  };
  
  // toggles between speech recognition
  const toggleListening = async (e) => {
    e.stopPropagation()

    // if(isSpeaking) return
    pulseSpeakerBubble()
    if(listening){
      onFinalTranscript(transcript)
      await stopListening()
    }else {
      setSpeechColour(0)
      await startListening()
    }
  }

  const requestAudioPermission = async () => {

    return new Promise((resolve, reject)=>{
      navigator.mediaDevices.getUserMedia({ audio: true,  })
      .then((promise) => {
        console.log(promise.active)
        resolve(true)
      })
      .catch((error) => {
        // Permission denied or error occurred
        console.error('Error requesting audio permission:', error);
        resolve(false)
      });
    })
  }

  const handleDown = async (e) => {
  }
  
  const handleUp = async (e) => {
    await onFinalTranscript(transcript)
  }

  const handleTopClick = async (e) =>{
    e.stopPropagation()
    setResponseColour(0)
    await playAudio(responseAudio)
  }

  const playAudio = async (source) => {
    audio.src = source
    return new Promise(async (resolve, reject)=>{
      try{
        audio.pause()
        await audio.play();

        audio.onended = () => {
          resolve(true)
        }

      } catch (err){
        console.log(err)
        const test = document.querySelector('.test')
        test.style.color = 'red'
        test.innerHTML = err
        setTimeout(()=>{test.style.color = 'black'},1000)
        resolve(false)

      }
    })
  }

  const speak = async (text) => {
    // const test2 = document.querySelector('.test2')
    // const audioPermission = await requestAudioPermission()
    // test2.innerHTML = audioPermission
    // console.log(audioPermission)
    
    if(text == defaultResponsePhrase) return
    setIsSpeaking(true)
    await stopListening()
    setSpeakerState(2)
    const source = await generateSpeech(text)
    setResponseAudio(source)
    const response = await playAudio(source)
    
    if(response) {setResponseColour(0)}  
    setIsSpeaking(false)
    await stopListening()
    // if(isDown) await startListening()
    // else await stopListening()

  }

  const toggleContrast = () => {
    const TOGGLE_AMOUNT = 5
    
    const r = document.querySelector(':root')
    const percent = 100 + (contrast % TOGGLE_AMOUNT) * 15
    console.log(percent)
    r.style.setProperty('--contrast', `${percent}%`)
    setContrast(contrast + 1)
  }

  return (
    <section id = "Home" onClick = {toggleContrast}>

      <button className = 'top' onClick ={handleTopClick}>
        {/* <p>{botResponse}</p> */}
        <SpeechFooter 
          speech = {transcript} 
          response = {botResponse} 
          speechColour={speechColour} 
          responseColour={responseColour}/>
      </button>

      <div className="test" style={{position:'absolute', bottom: 0, opacity: 0}}>test</div>

      <div className = 'bottom'>
        <SpeakerBubble state = {speakerState} clickEvent = {toggleListening}/>
      </div>

    </section>
  );
};

export default Home;
