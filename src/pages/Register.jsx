import './css/Register.css';
import { useState, useEffect } from 'react';

// components
import SpeakerBubble from '../components/SpeakerBubble';

// functions
import System from '../auth/system';
import generateSpeech from '../functions/generateSpeech';

const SPEAKER_COLOURS = {
    on: '#FF5353',
    off: '#EBFF00'
}

const introText = [
    'This is the register page, say next to continue',
    'I will ask you a few personal questions to get to know you better',
    'I will repeat your answers back to you, all you have to do to confirm is say yes or no',
    'You will also be able edit your responses directly on the screen',
    'Ready to begin?'

]
let introCounter = 0

const triggerWords = [
    'next', // next page of information
    'repeat', // repeat page of information
    'back' // go back to step page
]

const userDetails = {
    name: '',
    email: '',
    age: -1,
    weight: -1,
}

const Register = () => {
    const [speech, setSpeech] = useState(introText[0])
    let speechOn = false

    let recognition = new window.webkitSpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    const turnRecognitionOn = async () => {
        try {
            await recognition.start() // do not use await here because it will block the rest of the code
            speechOn = true
        } catch (error) {
            // console.log(error)
        }
    }
    
    const turnRecognitionOff = async () => {
    try {
        await recognition.abort()// do not use await here because it will block the rest of the code
        speechOn = false
    } catch (error) {
        // console.log(error)
    }
    }

    let timeout = null
    recognition.onresult = (event) => {
        const last = event.results.length - 1
        const speech = event.results[last][0].transcript
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            console.log(speech)
            triggerWords.forEach(word => {
                if (speech.includes(word)) {
                    console.log(word)
                    turnRecognitionOff()
                    switch (word) {
                        case 'next':
                            introCounter++
                            setSpeech(introText[introCounter])
                            break
                        case 'repeat':
                            speak()
                            break
                        case 'back':
                            console.log('going back')
                            break
                        default:
                            break
                    }

                }
            })
        }, 700)
    }

    recognition.onend = () => {
        if (speechOn) {
            recognition.start()
        }
    }

    const changeSpeakerBubble = (isSpeaking = true) => {
        const bubble = document.querySelector('.speakerBubble')
        const inner = document.querySelector('.speakerBubble .inner')
        if (isSpeaking) {        
            bubble.style.backgroundColor = SPEAKER_COLOURS.on + '5d'
            inner.style.backgroundColor = SPEAKER_COLOURS.on + 'ff'
            bubble.style.animation = 'pulse 1s infinite'
        } else {
            bubble.style.backgroundColor = SPEAKER_COLOURS.off + '5d'
            inner.style.backgroundColor = SPEAKER_COLOURS.off + 'ff'
            bubble.style.animation = ''
        }
    
    }

    const speak = async () => {
        changeSpeakerBubble()
        await generateSpeech(speech)
        changeSpeakerBubble(false)
        turnRecognitionOn()
    }

    useEffect(() => {
        speak()

        if(speechOn) {
            turnRecognitionOn()
        }

    }, [speech])

    return (
        <div className="Register" onClick={speak}>
            <div className="top">
                <SpeakerBubble/>
            </div>
            <div className="bottom">
                <p>{speech}</p>
            </div>
        </div>
    )
}

export default Register;