import './css/Register.css';
import { useState, useEffect } from 'react';

// components
import SpeakerBubble from '../components/SpeakerBubble';
import SpeechFooter from '../components/SpeechFooter';

// functions
import System from '../auth/system';
import generateSpeech from '../functions/generateSpeech';

const SPEAKER_COLOURS = {
    on: '#FF5353',
    off: '#EBFF00'
}

const introText = [
    'This is the register page. Say "NEXT" to continue',
    'I will ask you a few personal questions to get to know you better. I will repeat your answers back to you, all you have to do to confirm is say yes or no',
    'You will also be able to edit your responses directly on the screen',
    'If I go too fast you can say "REPEAT" to hear the information again or say "BACK" to go to the previous page',
    'Ready to begin?'

]
let introCounter = 0

const questionsTest = [
    'What is your name? Say "MY NAME IS", and then followed by your name',
    'What is your approximate weight in kilograms? Say "MY WEIGHT IS", and then followed by your weight',
    'What is your age? Say "MY AGE IS", and then followed by your age',
]

let questionCounter = 0

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
    const [transcript, setTranscript] = useState('what you say appears here...')
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
            setTranscript(speech)
            triggerWords.forEach(async (word) => {
                if (speech.includes(word)) {
                    await turnRecognitionOff()
                    switch (word) {
                        case 'next':
                            nextPage()
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

    const nextPage = () => {
        if (introCounter < introText.length - 1) {
            introCounter++
            setSpeech(introText[introCounter])
        } else if (questionCounter < questionsTest.length) {
            setSpeech(questionsTest[questionCounter])
            questionCounter++
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

    const speak = async (transcript = null) => {
        turnRecognitionOff()
        changeSpeakerBubble()
        if(transcript) await generateSpeech(transcript)
        else await generateSpeech(speech)
        changeSpeakerBubble(false)
        turnRecognitionOn()
    }

    let reminder = null
    useEffect(() => {
        speak()

        if(speechOn) {
            turnRecognitionOn()
        }

        // if the user is inactive for 1 minute, remind them that the system is still listening
        clearTimeout(reminder)
        reminder = setTimeout(() => {
            speak('Hey are you still there? Say "NEXT" to continue or "REPEAT" to hear the information again or say "BACK" to go to the previous page')
        }, 60000)
    }, [speech])

    return (
        <div className="Register" onClick={speak}>
            <div className="top">
                <SpeakerBubble/>
            </div>
            <div className="bottom">
                <p>{speech}</p>
            </div>
            <SpeechFooter speech={transcript}/>
        </div>
    )
}

export default Register;