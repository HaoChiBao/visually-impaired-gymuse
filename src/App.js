import './App.css';
import { useState } from 'react';

function App() {
  const [speech, setSpeech] = useState('Text Goes Here...')
  let speechOn = false

  const main = async () => {
    const testElement = document.querySelector('p')
   
    let recognition = new window.webkitSpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    const button = document.querySelector('button')
    button.addEventListener('click', () => {

      if (!speechOn) {
        recognition.start()
        speechOn = true
      } else {
        recognition.stop()
        speechOn = false
      }
    })
    
    let timeout = null
    let speech = ''
    recognition.onresult = function (event) {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;

      clearTimeout(timeout)
      timeout = setTimeout(() => {
        setSpeech(transcript)
      }, 500)
    }
  
    recognition.onend = async function (event) {        
      console.log(speech)
      testElement.innerHTML = speech
    }
  }

  window.onload = async () => {
    await main()
  }

  return (
    <>
      <p>
        {speech}
      </p>
      <button>press</button>
    </>
  );
}

export default App;
