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

const system = new System()

const SPEAKER_COLOURS = {
    on: '#FF5353',
    off: '#ffd000'
}

const pageText = [
    // introduction
    'This is the register page. Say "NEXT" to continue ',
    'I will ask you a few personal questions to get to know you better. I will repeat your answers back to you, all you have to do to confirm is say yes or no',
    'You will also be able to edit your responses directly on the screen',
    'If I go too fast you can say "REPEAT" to hear the information again or say "BACK" to go to the previous page',
    'Ready to begin?',

    // user information
    'What is your name? Say "MY NAME IS", and then followed by your name',
    'Is your name',
    'What is your approximate weight in kilograms? Say "MY WEIGHT IS", and then followed by your weight',
    'Is your weight',
    'What is your age? Say "MY AGE IS", and then followed by your age',
    'Is your age',
]

let pageCounter = 0

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
    password: '',
}

let reminder = null // reminder to user that the system is still listening
let timeout = null // timeout to wait for user to finish speaking
let inputTimer = null
let speechOn = false

let isSpeaking = false

const Register = () => {
    const [speech, setSpeech] = useState(pageText[0])
    const [transcript, setTranscript] = useState('what you say appears here...')
    const [userInput, setUserInput] = useState('')

    let recognition = new window.webkitSpeechRecognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    const turnRecognitionOn = async () => {
        speechOn = true
        try {
            recognition.start() 
        } catch (error) {
            console.error(error)
        }
    }

    const generateUser = () => {
        const max = 5
        for(let i = 0; i < max; i++) {
            const username = `${userDetails.name}${i}`
            const email = `${username}@gmail.com`
            // system.register(email, 'password', username)
        }
    }
    
    const turnRecognitionOff = async () => {
        speechOn = false
        try {
            recognition.stop()
            // await recognition.abort()// do not use await here because it will block the rest of the code
        } catch (error) {
            console.error(error)
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

    const goToPage = (num) => {
        pageCounter = num

        if (pageText[pageCounter].includes('Is your')){
            setSpeech(pageText[pageCounter] + ' ' + userDetails[pageText[pageCounter].split(' ')[2]])
            openUserInput(userDetails[pageText[pageCounter].split(' ')[2]])
        } else {
            setSpeech(pageText[pageCounter])
            closeUserInput()
        }

    }

    const nextPage = () => {
        if(pageCounter < pageText.length - 1) {
            pageCounter++
            goToPage(pageCounter)
        } else {
            console.log('ending...')
        }
    }

    const previousPage = () => {
        if(pageCounter > 0){
            pageCounter--
            goToPage(pageCounter)
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
        console.log(pageCounter)
        if(pageCounter == 6){
            // name
            userDetails.name = value
            clearTimeout(inputTimer)
            inputTimer = setTimeout(() => {
                setSpeech(`Is your name ${value}?`)
            },500)
        } else if (pageCounter == 8) {
            clearTimeout(inputTimer)
            inputTimer = setTimeout(() => {
                setSpeech(`Is your weight ${value}?`)
            },500)
            // weight
            userDetails.weight = value
        } else if (pageCounter == 10){
            clearTimeout(inputTimer)
            inputTimer = setTimeout(() => {
                setSpeech(`Is your age ${value}?`)
            },500)
            //age
            userDetails.age = value
        }
    }

    
    const speak = async () => {
        if(isSpeaking) {console.error('NOTE: something is already being said') ; return}
        console.log (userDetails)
        // functions that run before the speech
        isSpeaking = true
        changeSpeakerBubble()
        
        const timer = setTimeout(() => {console.log('Speech took too long...')}, 10000)
        
        turnRecognitionOff()
        await generateSpeech(speech)
        turnRecognitionOn()
        
        clearTimeout(timer)
        
        // turn off or reset everything after the speech
        changeSpeakerBubble(false)
        isSpeaking = false
        turnRecognitionOn()
        
        // if the user is inactive for 1 minute, remind them that the system is still listening
        clearTimeout(reminder)
        reminder = setTimeout(async () => {
            isSpeaking = true
            changeSpeakerBubble()
            turnRecognitionOff()
            await generateSpeech('Hey are you still there? Say "NEXT" to continue or "REPEAT" to hear the information again or say "BACK" to go to the previous page')
            turnRecognitionOn()
            changeSpeakerBubble(false)
            isSpeaking = false
        }, 60000)
    }

    recognition.onresult = (event) => {
        if(!isSpeaking) {
            const last = event.results.length - 1
            let speech = event.results[last][0].transcript
            speech = speech.toLowerCase()
            setTranscript(speech)
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                triggerWords.forEach(async (word) => {
                    if (speech.includes(word)) {
                        // turnRecognitionOff()
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
                                goToPage(6)
                                break
                            case 'my weight is':
                                const weight = getNumberFromString(speech)[0]
                                userDetails.weight = weight
                                goToPage(8)
                                break
                            case 'my age is':
                                const age = getNumberFromString(speech)[0]
                                userDetails.age = age
                                goToPage(10)
                                break

                            case 'yes':
                                if(pageCounter == 4 || pageCounter == 6 || pageCounter == 8 || pageCounter == 10){
                                    nextPage()
                                }
                                break;
                                
                            case 'no':
                                if(pageCounter == 4 || pageCounter == 6 || pageCounter == 8 || pageCounter == 10){
                                    previousPage()
                                }
                                break

                            default:
                                break
                        }
                    }
                })
            }, 700)
        }
    }

    recognition.onend = () => {
        console.log('Speech recognition ending...')
        // if (speechOn) {
        //     recognition.start()
        // }
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