import './App.css';
import { useState } from 'react';



function App() {
  const [speech, setSpeech] = useState('Text Goes Here...')
  let speechOn = false
  
  const API_KEY = ''
  
  const generateSpeech = async (text) => {
    // const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${projectId}`;
    const apiUrl = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${API_KEY}`;
    
    const requestBody = JSON.stringify({
      input: { text: text },

      voice: { 
        languageCode: 'en-US', 
        name: "en-US-Studio-O"
      },

      audioConfig: { 
        audioEncoding: 'LINEAR16', 
        effectsProfileId: ['small-bluetooth-speaker-class-device'],
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
      console.log('Speech generated:', audioContent);
    } catch (err) {
      console.error('Error generating speech:', err.message || err);
    }
  }
  
  // Example usage:
  const textToSpeak = 'Hello, this is a sample text to be converted to speech.';
  generateSpeech(textToSpeak);
  


  const main = async () => {
   
    let recognition = new window.webkitSpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // const button = document.querySelector('button')

    const turnRecognitionOn = async () => {
      try {
        const body = document.querySelector('body')
        body.style.backgroundColor = 'lightgreen'
        await recognition.start()
        speechOn = true
      } catch (error) {
        console.log(error)
      }
    }
    
    const turnRecognitionOff = async () => {
      try {
        const body = document.querySelector('body')
        body.style.backgroundColor = 'lavender'
        // await recognition.stop()
        await recognition.abort()
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
      timeout = setTimeout(() => {
        setSpeech(transcript)
      }, 500)
    }
  
    recognition.onend = async function (event) {        
      // console.log(speech)
      // testElement.innerHTML = 'Speech Ended'
      console.log('Speech Ended')
      await turnRecognitionOff()
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
