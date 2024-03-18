import './css/Register.css';
import { useState, useEffect } from 'react';

// components
import SpeakerBubble from '../components/SpeakerBubble';
import SpeechFooter from '../components/SpeechFooter';

// functions
import System from '../auth/system';
import generateSpeech from '../functions/generateSpeech';
import getNumberFromString from '../functions/getNumberFromString';
import { get } from 'firebase/database';

const SPEAKER_COLOURS = {
    on: '#FF5353',
    off: '#ffd000'
}

const introText = [
    'This is the register page. Say "NEXT" to continue ',
    'I will ask you a few personal questions to get to know you better. I will repeat your answers back to you, all you have to do to confirm is say yes or no',
    'You will also be able to edit your responses directly on the screen',
    'If I go too fast you can say "REPEAT" to hear the information again or say "BACK" to go to the previous page',
    'Ready to begin?',
]
let introCounter = 1

const questionsTest = [
    'What is your name? Say "MY NAME IS", and then followed by your name',
    'Is your name',
    'What is your approximate weight in kilograms? Say "MY WEIGHT IS", and then followed by your weight',
    'Is your weight',
    'What is your age? Say "MY AGE IS", and then followed by your age',
    'Is your age',
]

let questionCounter = 0

const triggerWords = [
    'next', // next page of information
    'repeat', // repeat page of information
    'back', // go back to step page

    'my name is',
    'my weight is',
    'my age is',

    'yes', // confirm the information
    'no', // deny the information
]

const userDetails = {
    name: '',
    email: '',
    age: -1,
    weight: -1,
}

let reminder = null // reminder to user that the system is still listening
let timeout = null // timeout to wait for user to finish speaking

const Register = () => {
    const [speech, setSpeech] = useState(introText[0])
    const [transcript, setTranscript] = useState('what you say appears here...')
    const [userInput, setUserInput] = useState('')
    let speechOn = false

    let recognition = new window.webkitSpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    const turnRecognitionOn = async () => {
        speechOn = true
        try {
            // check if recognition is already on
            if (recognition && recognition.state === 'running') {
                return
            }
            recognition.start() 
        } catch (error) {
            // console.log(error)
        }
    }
    
    const turnRecognitionOff = async () => {
        speechOn = false
        try {
            await recognition.abort()// do not use await here because it will block the rest of the code
        } catch (error) {
            // console.log(error)
        }
    }
    
    const openUserInput = (value = '') => {
        const input = document.querySelector('input')
        input.style.opacity = 1
        input.style.pointerEvents = 'all'
        input.value = value
    }

    const closeUserInput = () => {
        const input = document.querySelector('input')
        input.style.opacity = 0
        input.style.pointerEvents = 'none'
        input.value = ''
    }

    recognition.onresult = (event) => {
        const last = event.results.length - 1
        let speech = event.results[last][0].transcript
        speech = speech.toLowerCase()
        setTranscript(speech)
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            triggerWords.forEach(async (word) => {
                if (speech.includes(word)) {
                    turnRecognitionOff()
                    switch (word) {
                        case 'next':
                            nextPage()
                            break
                        case 'repeat':
                            await speak()
                            break
                        case 'back':
                            previousPage()
                            break

                        case 'my name is':
                            const name = speech.split('my name is')[1].trim()
                            userDetails.name = name
                            nextPage()
                            break
                        case 'my weight is':
                            const weight = getNumberFromString(speech)[0]
                            userDetails.weight = weight
                            nextPage()
                            break
                        case 'my age is':
                            const age = getNumberFromString(speech)[0]
                            userDetails.age = age
                            nextPage()
                            break

                        case 'yes':
                            if(introCounter >= introText.length - 1 && questionCounter <= 0){
                                console.log(0)
                                nextPage()
                            } else if (questionCounter % 2 == 0 && questionCounter > 0) {
                                nextPage()
                            } else {
                                turnRecognitionOn()
                            }
                            break;

                        default:
                            break
                    }
                }
            })
        }, 700)
    }

    recognition.onend = () => {
        console.log('Speech recognition ending...')
        // if (speechOn) {
        //     recognition.start()
        // }
    }

    const nextPage = () => {
        console.log(questionCounter, introCounter)
        if (introCounter < introText.length ) {
            introCounter++
            setSpeech(introText[introCounter-1])
        } else if (questionCounter < questionsTest.length) {
            if (questionCounter < questionsTest.length) questionCounter++
            if((questionCounter - 1) % 2 === 0) {
                setSpeech(questionsTest[questionCounter-1])
                closeUserInput()
            } else {
                setSpeech(questionsTest[questionCounter-1] + ' ' + userDetails[questionsTest[questionCounter-1].split(' ')[2]])
                openUserInput(userDetails[questionsTest[questionCounter-1].split(' ')[2]])
            }
        }
    }

    const previousPage = () => {
        console.log(questionCounter, introCounter)
        if(questionCounter > 1) {
            questionCounter--
            if(questionCounter % 2 == 0) {
                setSpeech(questionsTest[questionCounter])
                closeUserInput()
            } else {
                setSpeech(questionsTest[questionCounter] + ' ' + userDetails[questionsTest[questionCounter].split(' ')[2]])
                openUserInput(userDetails[questionsTest[questionCounter].split(' ')[2]])
            }
        } else if (introCounter > 0 || introText.length - 1 == introCounter) {
            if(introCounter != introText.length - 1) introCounter-- //decrement the counter again if it is not the last page
            if (questionCounter > 0) questionCounter = 0 // reset the question counter
            setSpeech(introText[introCounter])
            closeUserInput()
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

    const handleInput = (e) => {
        const value = e.target.value + e.key
        console.log(value)
    }

    let isSpeaking = false
    const speak = async () => {
        if(isSpeaking) {console.error('NOTE: something is already being said') ; return}
        console.log (userDetails)
        // functions that run before the speech
        isSpeaking = true
        turnRecognitionOff()
        changeSpeakerBubble()

        const timer = setTimeout(() => {console.log('Speech took too long...')}, 10000)

        await generateSpeech(speech)

        clearTimeout(timer)

        // turn off or reset everything after the speech
        changeSpeakerBubble(false)
        turnRecognitionOn()
        isSpeaking = false
        
        // if the user is inactive for 1 minute, remind them that the system is still listening
        clearTimeout(reminder)
        reminder = setTimeout(async () => {
            turnRecognitionOff()
            changeSpeakerBubble()
            await generateSpeech('Hey are you still there? Say "NEXT" to continue or "REPEAT" to hear the information again or say "BACK" to go to the previous page')
            changeSpeakerBubble(false)
            turnRecognitionOn()
        }, 60000)
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
                <input type="text" placeholder='details...' onKeyDown={handleInput}/>
            </div>
            <SpeechFooter speech={transcript}/>
        </div>
    )
}

export default Register;