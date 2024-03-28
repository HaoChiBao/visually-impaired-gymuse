import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import SpeechFooter from '../components/SpeechFooter';
import { SpeakerBubble, changeSpeakerBubble, pulseSpeakerBubble } from '../components/SpeakerBubble';

import generateResponse from '../functions/generateResponse';
import generateSpeech from '../functions/generateSpeech';

import './css/Test.css'

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
const defaultTranscriptPhrase = 'user voice here'

const Home = () => {
  const [transcript, setTranscript] = useState(defaultTranscriptPhrase); // stores the text generated from STT
  const [botResponse, setBotResponse] = useState(defaultResponsePhrase)
  const [speakerState, setSpeakerState] = useState(0); // determines the state of the speaker bubble 
  const [isDown, setIsDown] = useState(false)

  const [isSpeaking, setIsSpeaking] = useState(false)
  const { finalTranscript, interimTranscript, resetTranscript, listening } = useSpeechRecognition();

  const [test, setTest] = useState('test')
  // executes when the final result occurs
  useEffect(() => {
    if (finalTranscript !== '') {
      onFinalTranscript(finalTranscript);
      setTranscript(finalTranscript);
      resetTranscript();
    }
  }, [finalTranscript, resetTranscript]);

  useEffect(()=>{
    if(interimTranscript != ''){
      setTranscript(interimTranscript)
      pulseSpeakerBubble()
    }
  },[interimTranscript])

  useEffect(() => {
    speak(botResponse)
  },[botResponse])

  useEffect(()=>{console.log(listening)},[listening])
  // 
  const onFinalTranscript = async (transcript) => {
    console.log('Final result:', transcript);
    console.log(isSpeaking)
    if((transcript.toLowerCase()).includes(keyword) && !isSpeaking){
      chatHistory.push({role: 'user', content: transcript + contentAdd})
      const [response, copyChatHistory] = await generateResponse(chatHistory)
      chatHistory = copyChatHistory
      console.log(chatHistory)
      console.log(response)
      setBotResponse(response)
    } else {

    }
  };

  // start speech recognition
  const startListening = async () => {
    setSpeakerState(1)
    if(!listening) await SpeechRecognition.startListening({ continuous: true });
  };
  
  // stop speech recognition
  const stopListening = async () => {
    setSpeakerState(0)
    if(listening) await SpeechRecognition.stopListening();
  };
  
  // toggles between speech recognition
  const toggleListening = async () => {
    // if(isSpeaking) return
    pulseSpeakerBubble()
    if(listening){await stopListening()}
    else await startListening()
  }

  const requestAudioPermission = async () => {

    return new Promise((resolve, reject)=>{
      navigator.mediaDevices.getUserMedia({ audio: true })
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
    setIsDown(true)
    pulseSpeakerBubble()
    await startListening()
    e.preventDefault()
  }
  
  const handleUp = async (e) => {
    setIsDown(false)
    pulseSpeakerBubble()
    await stopListening()
    e.preventDefault()
    // onFinalTranscript(transcript)
  }

  const speak = async (text) => {
    if(text == defaultResponsePhrase) return
    const test2 = document.querySelector('.test2')
    const audioPermission = await requestAudioPermission()
    test2.innerHTML = audioPermission
    // console.log(audioPermission)
    
    setIsSpeaking(true)
    await stopListening()
    setSpeakerState(2)
    const response = await generateSpeech(text)
    
    const test = document.querySelector('.test')
    test.innerHTML = response

    setIsSpeaking(false)
    if(isDown) await startListening()
    else await stopListening()

  }

  return (
    <section>

      <button className = 'top'>
        {/* <p>{botResponse}</p> */}
        <SpeechFooter speech = {transcript} response = {botResponse}/>
      </button>

      {/* <div className="test">{test}</div> */}
      <div className="test">test</div>
      <div className="test2">test2</div>

      {/* <div className = 'bottom' onClick={toggleListening}> */}
      <div className = 'bottom' 
        onMouseDown={handleDown} 
        onTouchStart={handleDown}

        onMouseUp={handleUp}
        onTouchEnd={handleUp}
      >
        {/* <div>{listening ? <p>T</p> : <p>F</p>}</div> */}
        <SpeakerBubble state = {speakerState}/>
      </div>

    </section>
  );
};

export default Home;
