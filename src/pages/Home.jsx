import './css/Home.css';
import { useState, useEffect } from 'react';

// components
import SpeechFooter from '../components/SpeechFooter';

// functions
import generateResponse from '../functions/generateResponse'
import generateSpeech from '../functions/generateSpeech'

import System from '../auth/system'

// icons
import microphone from '../images/microphone.png'
import lock from '../images/padlock.png'
import unlock from '../images/padlock-unlock.png'
import speaking from '../images/speaking2.png'

const system = new System()


const Home = () => {
  const MICROPHONE_COLOURS ={
    hold: '#d9d9d9',
    lock: '#90FF5B',
    off: '#FF5353'
  }
  const [speech, setSpeech] = useState('Hold to talk...')
  const [transcript, setTranscript] = useState('what you say appears here...')
  const [icon, setIcon] = useState(microphone)
  
  const main = async () => {
    
    let speechOn = false
  
    // what user needs to say to trigger response
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

    const microphone_element = document.querySelector('.microphone')
    const icon_element = document.querySelector('.microphone img')
    const inner_element = document.querySelector('.microphone .inner')
    const CENTER = {x: 50, y: 50}
    const multiplier = 20
    const swipeDistance = 300

    // const button = document.querySelector('button')

    const turnRecognitionOn = async () => {
      try {
        await recognition.start()
        setSpeech('Listening...')
        generateSpeech('Listening') // do not use await here because it will block the rest of the code
        speechOn = true
      } catch (error) {
        // console.log(error)
      }
    }
    
    const turnRecognitionOff = async () => {
      try {
        await recognition.abort()
        setSpeech('Not Listening...')
        generateSpeech('No longer listening') // do not use await here because it will block the rest of the code
        speechOn = false
      } catch (error) {
        // console.log(error)
      }
    }

    // Open microphone element on DOM
    const openMicrophone = async (x, y) => {
      const microphone = document.querySelector('.microphone')
      microphone.style.width = '500px'
      microphone.style.left = x + 'px'
      microphone.style.top = y + 'px'
    }

    // Close microphone element on DOM
    const closeMicrophone = async () => {
      const microphone = document.querySelector('.microphone')
      microphone.style.width = '0px'
    }

    // Reset microphone element on DOM (default colour and icon)
    const resetMicrophone = async () => {
      microphone_element.style.backgroundColor = MICROPHONE_COLOURS.hold + '5d'
      inner_element.style.backgroundColor = MICROPHONE_COLOURS.hold + 'ff'
      setIcon(microphone)
      inner_element.style.left = `${CENTER.x}%`
      inner_element.style.top = `${CENTER.y}%`

      icon_element.style.left = `${CENTER.x}%`
      icon_element.style.top = `${CENTER.y}%`  
    }

    const lockMicrophone = async () => {
      resetMicrophone()
      microphone_element.style.backgroundColor = MICROPHONE_COLOURS.lock + '5d'
      inner_element.style.backgroundColor = MICROPHONE_COLOURS.lock + 'ff'
      setIcon(lock)
    }

    const setMicrophoneOff = async () => {
      microphone_element.style.backgroundColor = MICROPHONE_COLOURS.off + '5d'
      inner_element.style.backgroundColor = MICROPHONE_COLOURS.off + 'ff'
    }

    const pulseMicrophone = async () => {
      if(!speechOn) return
      microphone_element.style.width = '550px'
      setTimeout(() => {
        if(!speechOn) return
        microphone_element.style.width = '500px'
      }, 100)
    }

    closeMicrophone()

    const mousePos = {x: 0, y: 0}
    let mouseDown = false
    let lockOn = false

    // function for mousedown and touchdown
    const handleEventDown = async (x,y) => {
      await turnRecognitionOn()
      openMicrophone(x, y)
      mousePos.x = x
      mousePos.y = y
      mouseDown = true
    }
    const handleEventUp = async (x,y) => {
      mouseDown = false
      const distance = Math.sqrt((x - mousePos.x)**2 + (y - mousePos.y)**2)
      if (distance > swipeDistance) {
        lockMicrophone()  
        lockOn = true
      } else {
        await turnRecognitionOff()
        closeMicrophone()
        resetMicrophone()
        lockOn = false
      }
    }
    const handleEventMove = async (x,y) => {
      if(!mouseDown) return
      const offsetX = x - mousePos.x
      const offsetY = y - mousePos.y
      icon_element.style.left = `${CENTER.x + offsetX/window.innerWidth*multiplier*2}%`
      icon_element.style.top = `${CENTER.y + offsetY/window.innerHeight*multiplier*2}%`
      inner_element.style.left = `${CENTER.x + offsetX/window.innerWidth*multiplier}%`
      inner_element.style.top = `${CENTER.y + offsetY/window.innerHeight*multiplier}%`
    }

    window.addEventListener('mousedown', async (event) => {event.preventDefault(); handleEventDown(event.clientX, event.clientY)})
    window.addEventListener('touchstart', async (event) => {handleEventDown(event.touches[0].clientX, event.touches[0].clientY)})

    window.addEventListener('mouseup', async (event) => {event.preventDefault(); handleEventUp(event.clientX, event.clientY)})
    window.addEventListener('touchend', async (event) => {handleEventUp(event.changedTouches[0].clientX, event.changedTouches[0].clientY)})

    window.addEventListener('mousemove', async (event) => {event.preventDefault(); handleEventMove(event.clientX, event.clientY)})
    window.addEventListener('touchmove', async (event) => {handleEventMove(event.touches[0].clientX, event.touches[0].clientY)})


    window.addEventListener('contextmenu', async (e) => {e.preventDefault()})
    window.addEventListener('', async (e) => {e.preventDefault()})

    let timeout = null
    recognition.onresult = function (event) {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      // console.log(transcript)
      pulseMicrophone()

      clearTimeout(timeout)
      timeout = setTimeout(async () => {
        console.log(transcript)
        setTranscript(transcript)

        if (transcript.toLowerCase().includes(keyword.toLowerCase())){
          
          await turnRecognitionOff()
          setMicrophoneOff()
          setIcon(speaking)
          
          // add user input to chat history
          chatHistory.push({role: 'user', content: transcript + contentAdd})
          const [response, copyChatHistory] = await generateResponse(chatHistory)
          
          // update chat history with response
          chatHistory = copyChatHistory
          console.log(chatHistory)

          setSpeech(chatHistory[chatHistory.length - 1].content)

          // read out the response
          await generateSpeech(response)

          if(lockOn) lockMicrophone()
          else resetMicrophone()

          await turnRecognitionOn()

          setSpeech('Listening...')
        } else {
          setSpeech('I didn\'t catch that. Please try again.')
        }

      }, 500)
    }
  
    recognition.onend = async function (event) {     
      console.log('Speech recognition ending...')
      
      // if the recognition timesout, turn it back on
      if (speechOn) {
        await turnRecognitionOn()
      }

    }
  }

  useEffect( () => {
    main()
  },[])

  return (
    <div className = 'Home'>
      <h2>
        {speech}
      </h2>

      <div className="microphone">
        <div className="inner">
          <img src={icon} alt="" />
        </div>
      </div>
      <SpeechFooter speech = {transcript} />
    </div>
  );
}

export default Home;