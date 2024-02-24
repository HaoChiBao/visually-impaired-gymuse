import './App.css';
import { useState } from 'react';
import { GOOGLE_TTS_KEY } from './API_KEYS';

function App() {
  const [speech, setSpeech] = useState('Text Goes Here...')
  let speechOn = false
  
  const API_KEY = GOOGLE_TTS_KEY;
  
  const main = async () => {

    let audio = new Audio();
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
        audio.play();

      } catch (err) {
        console.error('Error generating speech:', err.message || err);
      }
    }

    generateSpeech('Hello, World!')
    
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
