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

const Register = () => {
    const [speech, setSpeech] = useState('This is the register page')
    let speechOn = false

    let recognition = new window.webkitSpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

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

    useEffect(() => {
        console.log('Register')
    }, [])

    useEffect(() => {
        const main = async () => {
            changeSpeakerBubble()
            await generateSpeech(speech)
            changeSpeakerBubble(false)
        }
        main()
    }, [speech])

    return (
        <div className="Register">
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