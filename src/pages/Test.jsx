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

const defaultStartPhrase = 'press to talk...'

const Test = () => {
  const [transcript, setTranscript] = useState(''); // stores the text generated from STT
  const [botResponse, setBotResponse] = useState(defaultStartPhrase)
  const [speakerState, setSpeakerState] = useState(0); // determines the state of the speaker bubble 

  const [isSpeaking, setIsSpeaking] = useState(false)
  const { finalTranscript, interimTranscript, resetTranscript, listening } = useSpeechRecognition();

  // executes when the final result occurs
  useEffect(() => {
    if (finalTranscript !== '') {
      onFinalTranscript(finalTranscript);
      resetTranscript(); // Reset transcript after saving
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
    setTranscript(transcript);

    if((transcript.toLowerCase()).includes('bro')){
      chatHistory.push({role: 'user', content: transcript + contentAdd})
      const [response, copyChatHistory] = await generateResponse(chatHistory)
      chatHistory = copyChatHistory
      console.log(chatHistory)
      console.log(response)
      setBotResponse(response)
    } else {

    }
  };

  const startListening = async () => {
    setSpeakerState(1)
    await SpeechRecognition.startListening({ continuous: true });
  };
  
  const stopListening = async () => {
    setSpeakerState(0)
    await SpeechRecognition.stopListening();
  };
  
  const toggleListening = async () => {
    // if(isSpeaking) return

    if(listening){await stopListening()}
    else await startListening()
  }

  const speak = async (text) => {
    if(text == defaultStartPhrase) return
    setIsSpeaking(true)
    await stopListening()
    setSpeakerState(2)
    const response = await generateSpeech(text)
    console.log(response)
    await startListening()
    setIsSpeaking(false)
  }

  return (
    <section>

      <button className = 'top' onClick={toggleListening}>
        <SpeakerBubble state = {speakerState}/>
      </button>

      <div className = 'bottom'>
        {/* <div>{listening ? <p>T</p> : <p>F</p>}</div> */}
        <p>{botResponse}</p>
      </div>

      <SpeechFooter speech = {transcript}/>
    </section>
  );
};

export default Test;
