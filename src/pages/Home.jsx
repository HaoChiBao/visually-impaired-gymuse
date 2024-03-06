import './css/Home.css';
import { useState, useEffect } from 'react';

import generateResponse from '../functions/generateResponse'
import generateSpeech from '../functions/generateSpeech'

import System from '../auth/system'

import microphone from '../images/microphone.png'
import lock from '../images/padlock.png'
import unlock from '../images/padlock-unlock.png'

const system = new System()


const Home = () => {
  const MICROPHONE_COLOURS ={
    hold: '#d9d9d9',
    lock: '#90FF5B',
    off: '#FF5353'
  }
  const [speech, setSpeech] = useState('Text Goes Here...')
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

    // const button = document.querySelector('button')

    const turnRecognitionOn = async () => {
      try {
        await recognition.start()
        setSpeech('Listening...')
        speechOn = true
      } catch (error) {
        console.log(error)
      }
    }
    
    const turnRecognitionOff = async () => {
      try {
        await recognition.abort()
        setSpeech('Not Listening...')
        speechOn = false
      } catch (error) {
        console.log(error)
      }
    }

    const openMicrophone = async (x, y) => {
      const microphone = document.querySelector('.microphone')
      microphone.style.width = '500px'
      microphone.style.left = x + 'px'
      microphone.style.top = y + 'px'
    }

    const closeMicrophone = async () => {
      const microphone = document.querySelector('.microphone')
      microphone.style.width = '0px'
    }

    closeMicrophone()

    const mousePos = {x: 0, y: 0}
    let mouseDown = false
    window.addEventListener('mousedown', async (e) => {
      e.preventDefault()
      const x = e.clientX
      const y = e.clientY
      await turnRecognitionOn()
      openMicrophone(x, y)
      mousePos.x = x
      mousePos.y = y

      mouseDown = true
    })

    window.addEventListener('mouseup', async (e) => {
      e.preventDefault()
      const x = e.clientX
      const y = e.clientY
      
      mouseDown = false
      
      // check if microphone swiped to lock
      const distance = Math.sqrt((x - mousePos.x)**2 + (y - mousePos.y)**2)
      console.log(distance)
      if (distance > 100) {
        setIcon(lock)
        microphone_element.style.backgroundColor = MICROPHONE_COLOURS.lock + '5d'

        inner_element.style.backgroundColor = MICROPHONE_COLOURS.lock + 'ff' 
        inner_element.style.left = `${CENTER.x}%`
        inner_element.style.top = `${CENTER.y}%`

        icon_element.style.left = `${CENTER.x}%`
        icon_element.style.top = `${CENTER.y}%`

        

      } else {
        await turnRecognitionOff()
        closeMicrophone()
      }
    })

    window.addEventListener('mousemove', async (e) => {
      e.preventDefault()

      if(!mouseDown) return
      const x = e.clientX
      const y = e.clientY

      const offsetX = x - mousePos.x
      const offsetY = y - mousePos.y

      icon_element.style.left = `${CENTER.x + offsetX/window.innerWidth*multiplier*2}%`
      icon_element.style.top = `${CENTER.y + offsetY/window.innerHeight*multiplier*2}%`

      inner_element.style.left = `${CENTER.x + offsetX/window.innerWidth*multiplier}%`
      inner_element.style.top = `${CENTER.y + offsetY/window.innerHeight*multiplier}%`
    })

    let timeout = null
    recognition.onresult = function (event) {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;

      clearTimeout(timeout)
      timeout = setTimeout(async () => {
        console.log(transcript)

        if (transcript.toLowerCase().includes(keyword.toLowerCase())){
          
          await turnRecognitionOff('#ff7f7f')
          
          // add user input to chat history
          chatHistory.push({role: 'user', content: transcript + contentAdd})
          const [response, copyChatHistory] = await generateResponse(chatHistory)
          
          // update chat history with response
          chatHistory = copyChatHistory
          console.log(chatHistory)

          setSpeech(chatHistory[chatHistory.length - 1].content)

          // read out the response
          await generateSpeech(response)

          await turnRecognitionOn()

          setSpeech('Listening...')
        } else {
          setSpeech('I didn\'t catch that. Please try again.')
        }

      }, 500)
    }
  
    recognition.onend = async function (event) {        
      // console.log('Speech recognition has stopped...')
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
    </div>
  );
}

export default Home;