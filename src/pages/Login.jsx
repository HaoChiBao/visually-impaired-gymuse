import { useState, useEffect } from "react";
import './css/Login.css';

import System from "../auth/system";


const system = new System();

// system.signOut()
const SpeechBubble = ({word}) => {
    return (
        <div className="speech-bubble">
            {word}
        </div>
    )
}

const Login = () => {
    const [speech, setSpeech] = useState('Text Goes Here...')
    const [speechBubbles, setSpeechBubbles] = useState(['say', 'your', 'password', 'phrase'])

    let speechOn = false
    let keyword = 'bro'

    const handleSubmit = (e)=>{
        e.preventDefault();
        const input = e.target.querySelector('input');
        const value = input.value;
        if(value !== ''){
            const email = `${value}@gmail.com`;
            const password = speech.replace(' ', '')
            console.log(password)
            console.log(email)
            system.register(email, password, value);
        }
    }

    useEffect(() => {
        let recognition = new window.webkitSpeechRecognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

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

        turnRecognitionOn()

        let timeout = null
        recognition.onresult = function (event) {
        const result = event.results[event.results.length - 1];
        let transcript = result[0].transcript;

        clearTimeout(timeout)
        timeout = setTimeout(async () => {
            transcript = transcript.toLowerCase()
            transcript = transcript.trim()
            console.log(transcript)
            const transcriptArray = transcript.split(' ')
            setSpeechBubbles(transcriptArray)
            setSpeech(transcript)
        }, 500)
        }
    
        recognition.onend = async function (event) {        
        // console.log('Speech recognition has stopped...')
        }
    },[]);

    return (
        <section className = 'Login'>

            <div className="password">
                {speechBubbles.map((word, index) => {
                    return <SpeechBubble key={index} word={word}/>
                })}
            </div>

            <form action="" onSubmit={handleSubmit}>
                <input placeholder="username"></input>
                <button>
                    +
                </button>
            </form>
        </section>
    );
}

export default Login;