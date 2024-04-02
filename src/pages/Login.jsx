import './css/Login.css';
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
    'This is the LOGIN page. Say "NEXT" to continue ',
    "If you don't have an account, say 'REGISTER' to create one, or say 'HOME' if you would like to continue without an account",
    'I will ask you a few personal questions to get to know you better. I will repeat your answers back to you, all you have to do to confirm is say yes or no',
    'You will also be able to edit your responses directly on the screen',
    'If I go too fast you can click the top half of the screen to hear the information again or say "BACK" to go to the previous page',
    'Ready to begin?', //5

    // user information
    'What is your name? Say "MY NAME IS", and then followed by your name',
    'Is your name',
    'What is your user number? This is the number that follows your name in your username. Say "MY NUMBER IS", and then followed by your number',
    'Is your number',

    'Perfect! Please say your sentence password', //this page automatically goes to the next
    'Say "COMPLETE PASSWORD" after your sentence so I know you are done', // this page automatically goes to the next
    'Is this correct?',
]

let pageCounter = 0

const triggerWords = [
    'next', // next page of information
    // 'repeat', // repeat page of information
    'back', // go back to step page

    'my name is',
    'my number is',

    'yes', // confirm the information
    'no', // deny the information

    'home', // go to home page
    'register', // go to register page

    'complete password', // indicates that the user is done speaking their password sentence
]

const userDetails = {
    name: '',
    number: -1,
    password: '',
    email: '',
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

let loginDone = false

let reminder = null // reminder to user that the system is still listening
let timeout = null // timeout to wait for user to finish speaking
let inputTimer = null
let speechOn = false

let isSpeaking = false

const defaultResponsePhrase = 'press to talk...'
// const defaultResponsePhrase = 'Lorem Ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
const defaultTranscriptPhrase = 'user voice here...'

const Login = () => {
    
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

    const signInUser = async () => {
        console.log(userDetails)
        console.log('Generating user...')
        if(userDetails.name == '' || userDetails.number == -1 || userDetails.password == '' ) {
            console.error('User details are not complete')
            return
        }

        const username = `${userDetails.name}-${userDetails.number}`.toLowerCase()
        const email = `${username}@gmail.com`
        userDetails.email = email
        const password = userDetails.password

        const response = await system.signIn(email, password, username)
    
        if(response) {
            loginDone = true
            const text = `Welcome back ${userDetails.name}! You have successfully logged in. Redirecting you to the home page...`
            setBotResponse(text)
        } else {
            const text = `I'm sorry, I couldn't log into your account. Double check your credentials`
            setBotResponse(text)
        }
    }

    const goToPage = (num) => {
        console.log(userDetails)
        pageCounter = num

        if (pageText[pageCounter].includes('Is your')){
            setBotResponse(pageText[pageCounter] + ' ' + userDetails[pageText[pageCounter].split(' ')[2]])
            // openUserInput(userDetails[pageText[pageCounter].split(' ')[2]])
        } 
        else if (pageCounter == 12){
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
            await signInUser()
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
        if (pageCounter == 10){
            nextPage()
        } 
        if (loginDone){
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

                        case 'register':
                            window.location.pathname = '/register'
                            break

                        case 'home':
                            window.location.pathname = '/'
                            break

                        case 'my name is':
                            const name = transcript.split('my name is')[1].trim()
                            userDetails.name = name
                            goToPage(7)
                            break
                        case 'my number is':
                            const number = getNumberFromString(transcript)[0]
                            userDetails.number = number
                            goToPage(9)
                            break

                        case 'yes':
                            console.log(pageCounter)
                            if(pageCounter == 5 || pageCounter == 7 || pageCounter == 9 || pageCounter == 12){
                                nextPage()
                            }
                            break;
                            
                        case 'no':
                            if(pageCounter == 5 || pageCounter == 7 || pageCounter == 9|| pageCounter == 12){
                                previousPage()
                            }
                            break

                        case 'complete password':
                            userDetails.password = transcript.split('complete password')[0].trim()
                            goToPage(12)
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
        <section id="Login" onClick={toggleContrast}>
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

export default Login;