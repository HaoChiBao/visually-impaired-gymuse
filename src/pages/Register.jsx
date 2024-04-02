import './css/Register.css';
import { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// components
import {SpeakerBubble, changeSpeakerBubble, pulseSpeakerBubble} from '../components/SpeakerBubble';
import SpeechFooter from '../components/SpeechFooter';

// functions
import System from '../auth/system';
import generateSpeech from '../functions/generateSpeech';
import getNumberFromString from '../functions/getNumberFromString';

// sounds
import onSound from '../audio/recognitionOn.mp3'
import offSound from '../audio/recognitionOff.mp3'

const system = new System()
const audio = new Audio()

// system.signOut()
const pageText = [
    // introduction
    'This is the register page. Say "NEXT" to continue. To login say "LOGIN", to go home say "HOME"',
    'I will ask you a few personal questions to get to know you better. I will repeat your answers back to you, all you have to do to confirm is say yes or no',
    'You will also be able to edit your responses directly on the screen',
    'If I go too fast you can click the top half of the screen to hear the information again or say "BACK" to go to the previous page',
    'Ready to begin?',

    // user information
    'What is your name? Say "MY NAME IS", and then followed by your name',
    'Is your name',
    'What is your approximate weight in kilograms? Say "MY WEIGHT IS", and then followed by your weight',
    'Is your weight',
    'What is your age? Say "MY AGE IS", and then followed by your age',
    'Is your age',
    'What is your approximate height in centimeters? Say "MY HEIGHT IS", and then followed by your height',
    'Is your height',

    'Perfect! Please think of a sentence I will use it as your password', //this page automatically goes to the next
    'Use sentences like "I really enjoy going to the gym," so that it is easy to remember', // this page automatically goes to the next
    'Say "COMPLETE PASSWORD" after your sentence so I know you are done', // this page automatically goes to the next
    'Is this correct?',
]

let pageCounter = 0

const triggerWords = [
    'next', // next page of information
    // 'repeat', // repeat page of information
    'back', // go back to step page

    'my name is',
    'my weight is',
    'my age is',
    'my height is',

    'yes', // confirm the information
    'no', // deny the information

    'login', // go to login page
    'home', // go to home page

    'complete password', // indicates that the user is done speaking their password sentence
]

const userDetails = {
    name: '',
    email: '',
    age: -1,
    weight: -1,
    password: '',
    id: '',
    height: -1,
    BMI: -1,
}

// const userDetails = {
//     name: 'james',
//     email: '',
//     age: 19,
//     weight: 80,
//     password: 'i like turtles',
//     height: 180,
//     BMI: 0,
//     id: -1,
// }

let registerDone = false

let reminder = null // reminder to user that the system is still listening
let timeout = null // timeout to wait for user to finish speaking
let inputTimer = null
let speechOn = false

let isSpeaking = false

const defaultResponsePhrase = 'press to talk...'
// const defaultResponsePhrase = 'Lorem Ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
const defaultTranscriptPhrase = 'user voice here...'

const Register = () => {
    
    const [transcript, setTranscript] = useState(defaultTranscriptPhrase); // stores the text generated from STT
    const [botResponse, setBotResponse] = useState(pageText[0])
    const [speakerState, setSpeakerState] = useState(0); // determines the state of the speaker bubble 

    const [isSpeaking, setIsSpeaking] = useState(false)
    const [resetUserString, setResetUserString] = useState(false)
    const { finalTranscript, interimTranscript, resetTranscript, listening } = useSpeechRecognition();

    const [responseAudio, setResponseAudio] = useState(null)

    const [speechColour, setSpeechColour] = useState(0)
    const [responseColour, setResponseColour] = useState(0)

    const [contrast, setContrast] = useState(1)

    const [test, setTest] = useState('test')
    // executes when the final result occurs
    useEffect(() => {
        if (finalTranscript !== '') {
        console.log('Final result:', finalTranscript)
        // onFinalTranscript(finalTranscript);
        setTranscript(finalTranscript);
        resetTranscript();
        setResetUserString(true)
        }
    }, [finalTranscript, resetTranscript]);

    useEffect(()=>{
        if(interimTranscript != ''){
        if(resetUserString){
            setTranscript('')
            setResetUserString(false)
        }

        setTranscript(interimTranscript)
        pulseSpeakerBubble()
        }
    },[interimTranscript])

    useEffect(() => {
        if(botResponse != defaultResponsePhrase){
        setResponseColour(1)
        speak(botResponse)
        }
    },[botResponse])

    const generateUser = async () => {
        console.log(userDetails)
        console.log('Generating user...')
        if(userDetails.name == '' || userDetails.age == -1 || userDetails.weight == -1 || userDetails.password == '' || userDetails.height == -1) {
            console.error('User details are not complete')
            return
        }
        userDetails.BMI = Math.round(userDetails.weight / ((userDetails.height / 100) ** 2))

        const name = (userDetails.name).replace(' ', '-').toLowerCase()
        let id = await system.getUserNumber(name)
        if(id == -1) { console.error('Error getting user number') ; return}
        id = parseInt(id) + 1
        
        const username = `${name}-${id}`
        const email = `${username}@gmail.com`
        userDetails.email = email
        const password = userDetails.password
        // console.log(id)
        // return
        const response = await system.register(email, password, username)
    
        if(response) {
            userDetails.id = id
            await system.addUserNumber(name)

            console.log(response)
            system.data.details = userDetails
            await system.setData(system.userRef, system.data)
        }
    }

    const goToPage = (num) => {
        console.log(userDetails)
        pageCounter = num

        if (pageText[pageCounter].includes('Is your')){
            setBotResponse(pageText[pageCounter] + ' ' + userDetails[pageText[pageCounter].split(' ')[2]])
            // openUserInput(userDetails[pageText[pageCounter].split(' ')[2]])
        } 
        else if (pageCounter == 16){
            setBotResponse(userDetails.password + ' ' + pageText[pageCounter])
            // openUserInput(userDetails.password)
        } 
        else {
            setBotResponse(pageText[pageCounter])
            // closeUserInput()
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
            setBotResponse(text)
            // closeUserInput()
        }
    }

    const previousPage = () => {
        if(pageCounter > 0){
            pageCounter--
            goToPage(pageCounter)
        }
    }
    
    const speak = async (text) => {
        if(text == defaultResponsePhrase) return
        setIsSpeaking(true)
        await stopListening()
        setSpeakerState(2)
        const source = await generateSpeech(text)
        setResponseAudio(source)
        const response = await playAudio(source)
        if(response) {setResponseColour(0)}  
        setIsSpeaking(false)
        await stopListening()

        // automatically complete this page
        if (pageCounter == 13 || pageCounter == 14){
            nextPage()
        } 
        if (registerDone){
            console.log('redirecting to home page')
            window.location.pathname = '/'
        }
    }

    const onFinalTranscript = async (transcript) => {
        // console.log('Final result:', transcript);
        // console.log(isSpeaking)
        if(!isSpeaking){
            let found = false
            triggerWords.forEach(async (word) => {
                
                if ((transcript.toLowerCase()).includes(word)) {
                    setResponseColour(2)
                    found = true
                    // turnRecognitionOff()
                    switch (word) {
                        case 'next':
                            nextPage()
                            break
                        // case 'repeat':
                        //     await repeat()
                        //     break
                        case 'back':
                            previousPage()
                            break

                        case 'login':
                            window.location.pathname = '/login'
                            break

                        case 'home':
                            window.location.pathname = '/'
                            break

                        case 'my name is':
                            const name = transcript.split('my name is')[1].trim()
                            userDetails.name = name
                            goToPage(6)
                            break
                        case 'my weight is':
                            const weight = getNumberFromString(transcript)[0]
                            userDetails.weight = weight
                            goToPage(8)
                            break
                        case 'my age is':
                            const age = getNumberFromString(transcript)[0]
                            userDetails.age = age
                            goToPage(10)
                            break

                        case 'my height is':
                            const height = getNumberFromString(transcript)[0]
                            userDetails.height = height
                            goToPage(12)
                            break

                        case 'yes':
                            console.log(pageCounter)
                            if(pageCounter == 4 || pageCounter == 6 || pageCounter == 8 || pageCounter == 10 || pageCounter == 12 || pageCounter == 16){
                                nextPage()
                            }
                            break;
                            
                        case 'no':
                            if(pageCounter == 4 || pageCounter == 6 || pageCounter == 8 || pageCounter == 10 || pageCounter == 12 || pageCounter == 16){
                                previousPage()
                            }
                            break

                        case 'complete password':
                            userDetails.password = transcript.split('complete password')[0].trim()
                            goToPage(16)
                            break

                        default:
                            break
                    }
                }
            })
            if(found) setSpeechColour(1) // indicates to user that the response is being processed
            else setSpeechColour(2) // indicates to user that the response was not processed
        } 
      };

    const repeat = async () => {
        await speak(botResponse)
    }

    const handleTopClick = async (e) =>{
        e.stopPropagation()
        setResponseColour(0)
        await playAudio(responseAudio)
    }

    const toggleContrast = () => {
        const TOGGLE_AMOUNT = 5
        
        const r = document.querySelector(':root')
        const percent = 100 + (contrast % TOGGLE_AMOUNT) * 15
        console.log(percent)
        r.style.setProperty('--contrast', `${percent}%`)
        setContrast(contrast + 1)
    }

      // start speech recognition
    const startListening = async () => {
        setSpeakerState(1)
        playAudio(onSound)
        if(!listening) await SpeechRecognition.startListening({ continuous: true });
    };
    
    // stop speech recognition
    const stopListening = async () => {
        setSpeakerState(0)
        playAudio(offSound)
        if(listening) await SpeechRecognition.stopListening();
    };
    
    // toggles between speech recognition
    const toggleListening = async (e) => {
        e.stopPropagation()

        // if(isSpeaking) return
        pulseSpeakerBubble()
        if(listening){
        onFinalTranscript(transcript)
        await stopListening()
        }else {
        setSpeechColour(0)
        await startListening()
        }
    }

    const playAudio = async (source) => {
        audio.src = source
        return new Promise(async (resolve, reject)=>{
          try{
            audio.pause()
            await audio.play();
    
            audio.onended = () => {
              resolve(true)
            }
    
          } catch (err){
            console.log(err)
            resolve(false)
          }
        })
      }

    return (
        <section id="Register" onClick={toggleContrast}>
            <div className="top" onClick={handleTopClick}>
                <SpeechFooter 
                    speech={transcript}
                    response={botResponse}
                    speechColour={speechColour}
                    responseColour={responseColour}/>
            </div>
            <div className="bottom">
                <SpeakerBubble state = {speakerState} clickEvent={toggleListening}/>
            </div>
        </section>
        
    )
}

export default Register;