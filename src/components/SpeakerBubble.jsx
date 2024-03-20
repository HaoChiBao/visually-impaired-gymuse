import './componentCss/SpeakerBubble.css'

import Speaker from '../images/speaking2.png'
import MicrophoneOn from '../images/microphone.png'
import MicrophoneOff from '../images/microphone2.png'
import { set } from 'firebase/database'

const SPEAKER_COLOURS = {
    speak: '#FF5353',
    listen: '#90FF5B',
    off: '#ffd000'
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
        bubble.style.backgroundColor = SPEAKER_COLOURS.speak + '5d'
        inner.style.backgroundColor = SPEAKER_COLOURS.speak + 'ff'
        
        bubble.style.animation = 'pulse 1s infinite'
        image.src = Speaker

    } else if (isListening){
        bubble.style.backgroundColor = SPEAKER_COLOURS.listen + '5d'
        inner.style.backgroundColor = SPEAKER_COLOURS.listen + 'ff'
        bubble.style.animation = ''
        image.src = MicrophoneOn
        
    } else {
        bubble.style.backgroundColor = SPEAKER_COLOURS.off + '5d'
        inner.style.backgroundColor = SPEAKER_COLOURS.off + 'ff'
        bubble.style.animation = ''
        image.src = MicrophoneOff
    }
}

const SpeakerBubble = () => {
    return (
        <div className="speakerBubble">
            <div className="inner">
                <img src={Speaker} alt="" />
            </div>
        </div>
    )
}

export { SpeakerBubble, changeSpeakerBubble, pulseSpeakerBubble};