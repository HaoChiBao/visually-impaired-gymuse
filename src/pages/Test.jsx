import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

import generateResponse from '../functions/generateResponse';
import generateSpeech from '../functions/generateSpeech';


let chatHistory = [
  {
    role: 'system',
    // content: 'You are a personal workout assistant. You are helping a user with their workout routine. You give unique and personalized advice to the user based on their needs and goals. You are also able to answer any questions the user may have about their workout routine.'
    content: 'You are a personal workout assistant'
  },
]
const contentAdd = '\n Keep the response length short and but keep content integrity.'



const Test = () => {
  const [transcript, setTranscript] = useState('');
  const { finalTranscript, interimTranscript, resetTranscript, listening } = useSpeechRecognition();

  // useEffect hook to save transcript automatically
  useEffect(() => {
    if (finalTranscript !== '') {
      saveTranscript(finalTranscript);
      resetTranscript(); // Reset transcript after saving
    }
  }, [finalTranscript, resetTranscript]);

  useEffect(()=>{console.log(interimTranscript)},[interimTranscript])

  const saveTranscript = async (transcript) => {
    console.log('Transcript saved:', transcript);
    setTranscript(transcript);

    if((transcript.toLowerCase()).includes('bro')){
      chatHistory.push({role: 'user', content: transcript + contentAdd})
      const [response, copyChatHistory] = await generateResponse(chatHistory)
      chatHistory = copyChatHistory
      console.log(chatHistory)
      console.log(response)

      await generateSpeech(response)
    }
  };

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const toggleListening = () => {
    if(listening){stopListening()}
    else startListening()
  }

  return (
    <div>
      <h1>Voice Transcription</h1>
      <button onClick={toggleListening}>Toggle Listening</button>
      <div>
        <p>Transcription: {transcript}</p>
      </div>
    </div>
  );
};

export default Test;
