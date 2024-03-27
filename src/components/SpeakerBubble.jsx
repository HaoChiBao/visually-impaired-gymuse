import './componentCss/SpeakerBubble.css'

import Speaker from '../images/speaking2.png'
import MicrophoneOn from '../images/microphone.png'
import MicrophoneOff from '../images/microphone2.png'
import { useEffect } from 'react'

const SPEAKER_COLOURS = {
    speak: '#FF5353',
    listen: '#90FF5B',
    off: '#ffd000'
}

const DEBUG = false

const transformBubble = (original = true) => {
    const bubble = document.querySelector('.speakerBubble')
    if(original) {
        bubble.style.setProperty('--border-radius', '50%')
        bubble.style.setProperty('--inner-diff', '80px')
        bubble.style.setProperty('--width', '30vh')
        bubble.style.setProperty('--height', '30vh')
    } else {
        bubble.style.setProperty('--border-radius', '10px')
        bubble.style.setProperty('--inner-diff', '20px')
        bubble.style.setProperty('--width', 'calc(100% - 20px)')
        bubble.style.setProperty('--height', '80px')
    }
}

const toggleTransform = () => {
    const bubble = document.querySelector('.speakerBubble')
    const height = bubble.style.getPropertyValue('--height')
    if(height === '30vh') {
        transformBubble(false)
    } else {
        transformBubble(true)
    }
}

const pulseSpeakerBubble = () => {
    const bubble = document.querySelector('.speakerBubble')
    bubble.style.transform = 'scale(1.1)'
    setTimeout(() => {bubble.style.transform = 'scale(1)'}, 100)
}

const changeSpeakerBubble = (isSpeaking = true, isListening = false) => {
    const bubble = document.querySelector('.speakerBubble')
    const inner = document.querySelector('.speakerBubble .inner')
    const image = document.querySelector('.speakerBubble img')
    if (isSpeaking) {        
        if(DEBUG) console.log(0)
        bubble.style.backgroundColor = SPEAKER_COLOURS.speak + '5d'
        inner.style.backgroundColor = SPEAKER_COLOURS.speak + 'ff'
        
        bubble.style.animation = 'pulse 1s infinite'
        image.src = Speaker
        
    } else if (isListening){
        if(DEBUG) console.log(1)
        bubble.style.backgroundColor = SPEAKER_COLOURS.listen + '5d'
        inner.style.backgroundColor = SPEAKER_COLOURS.listen + 'ff'
        bubble.style.animation = ''
        image.src = MicrophoneOn
        
    } else {
        if(DEBUG) console.log(2)
        bubble.style.backgroundColor = SPEAKER_COLOURS.off + '5d'
        inner.style.backgroundColor = SPEAKER_COLOURS.off + 'ff'
        bubble.style.animation = ''
        image.src = MicrophoneOff
    }
}

const SpeakerBubble = ({state}) => {
    useEffect(() => {
        if(state == 0){
            changeSpeakerBubble(false, false)
        } else if ( state == 1){
            changeSpeakerBubble(false, true)
        } else {
            changeSpeakerBubble(true, false)
        }
    },[state])
    return (
        <div className="speakerBubble">
            <div className="inner">
                <img src={Speaker} alt="" />
            </div>
        </div>
    )
}

export { SpeakerBubble, changeSpeakerBubble, pulseSpeakerBubble};