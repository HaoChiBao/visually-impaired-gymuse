import './css/Register.css';
import { useState, useEffect } from 'react';

// components
import {SpeakerBubble, changeSpeakerBubble, pulseSpeakerBubble} from '../components/SpeakerBubble';
import SpeechFooter from '../components/SpeechFooter';

// functions
import System from '../auth/system';
import generateSpeech from '../functions/generateSpeech';
import getNumberFromString from '../functions/getNumberFromString';

// sounds
import recognitionOnSound from '../audio/bellchime.mp3'
// import recognitionOffSound from '../audio/belloff.mp3'
import recognitionOffSound from '../audio/popup.mp3'

const system = new System()

// system.signOut()
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

    'Perfect! Please think of a sentence I will use it as your password', //this page automatically goes to the next
    'Use sentences like "I really enjoy going to the gym," so that it is easy to remember', // this page automatically goes to the next
    'Say "COMPLETE PASSWORD" after your sentence so I know you are done', // this page automatically goes to the next
    'Is this correct?',
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

    'complete password', // indicates that the user is done speaking their password sentence
]

const userDetails = {
    name: '',
    email: '',
    age: -1,
    weight: -1,
    password: '',
    id: '',
}

// const userDetails = {
//     name: 'james',
//     email: '',
//     age: 19,
//     weight: 80,
//     password: 'i like turtles',
//     id: -1,
// }

let registerDone = false

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
            changeSpeakerBubble(false, true)
            pulseSpeakerBubble()
            recognition.start() 
        } catch (error) {
            console.error(error)
        }
    }
    
    const turnRecognitionOff = async () => {
        speechOn = false
        try {
            pulseSpeakerBubble()
            recognition.stop()
            changeSpeakerBubble(false, false)
            // await recognition.abort()// do not use await here because it will block the rest of the code
        } catch (error) {
            console.error(error)
        }
    }

    const toggleRecognition = () => {
        const audio = new Audio()
        if(speechOn) {
            turnRecognitionOff()
            audio.src = recognitionOffSound
        } else {
            turnRecognitionOn()
            audio.src = recognitionOnSound
        }
        audio.play()
    }

    const generateUser = async () => {
        console.log('Generating user...')
        if(userDetails.name == '' || userDetails.age == -1 || userDetails.weight == -1 || userDetails.password == '') {
            console.error('User details are not complete')
            return
        }
        const name = (userDetails.name).replace(' ', '-').toLowerCase()
        let id = await system.getUserNumber(name)
        if(id == -1) { console.error('Error getting user number') ; return}
        id = parseInt(id) + 1
        
        const username = `${name}-${id}`
        const email = `${username}@gmail.com`
        userDetails.email = email
        const password = userDetails.password
        // console.log(id)
        const response = await system.register(email, password, username)
        // console.log(response)
        if(response) {
            // console.log('User created')
            // console.log(username)
            userDetails.id = id
            await system.addUserNumber(name)
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
        } 
        else if (pageCounter == 14){
            setSpeech(userDetails.password + ' ' + pageText[pageCounter])
            openUserInput(userDetails.password)
        } 
        else {
            setSpeech(pageText[pageCounter])
            closeUserInput()
        }

    }

    const nextPage = async () => {
        if(pageCounter < pageText.length - 1) {
            pageCounter++
            goToPage(pageCounter)
        } else {
            await generateUser()
            registerDone = true
            const text = `I've created your account, your username is: ${(userDetails.name).toUpperCase()}-${userDetails.id}. It's your name with a number at the end. I will take you to the home page now`
            setSpeech(text)
            closeUserInput()
        }
    }

    const previousPage = () => {
        if(pageCounter > 0){
            pageCounter--
            goToPage(pageCounter)
        }
    }

    const handleInput = (e) => {
        let value = e.target.value
        if(e.key != 'Enter' && e.key != 'Backspace') value += e.key
        
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
        } else if (pageCounter == 14){
            clearTimeout(inputTimer)
            inputTimer = setTimeout(() => {
                setSpeech(`${value} ${pageText[pageCounter]}`)
            },500)
            //password
            userDetails.password = value
        }
    }

    const handleClick = (e) => {
        if(isSpeaking) return
        toggleRecognition()
    }
    
    const speak = async () => {
        if(isSpeaking) {console.error('NOTE: something is already being said') ; return}
        console.log(pageCounter)
        console.log (userDetails)
        // functions that run before the speech
        isSpeaking = true
        
        const timer = setTimeout(() => {console.log('Speech took too long...')}, 10000)
        
        turnRecognitionOff()
        changeSpeakerBubble(true)
        await generateSpeech(speech)
        turnRecognitionOn()
        isSpeaking = false
        
        clearTimeout(timer)

        // automatically complete this page
        if (pageCounter == 11 || pageCounter == 12){
            nextPage()
        } 
        if (registerDone){
            console.log('redirecting to home page')
            // window.location.pathname = '/'
        }
        
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

            // get the transcript
            const last = event.results.length - 1
            let speech = event.results[last][0].transcript
            speech = speech.toLowerCase()

            setTranscript(speech)
            pulseSpeakerBubble()

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
                                if(pageCounter == 4 || pageCounter == 6 || pageCounter == 8 || pageCounter == 10 || pageCounter == 14){
                                    nextPage()
                                }
                                break;
                                
                            case 'no':
                                if(pageCounter == 4 || pageCounter == 6 || pageCounter == 8 || pageCounter == 10 || pageCounter == 14){
                                    previousPage()
                                }
                                break

                            case 'complete password':
                                userDetails.password = speech.split('complete password')[0].trim()
                                goToPage(14)
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
        speechOn = false
        changeSpeakerBubble(false, false)
    }
    
    useEffect(() => {
        speak()
        
        if(speechOn) {
            turnRecognitionOn()
        }
        
    }, [speech])

    return (
        <div className="Register">
            <div className="top" onClick={handleClick}>
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