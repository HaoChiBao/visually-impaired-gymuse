import { useEffect } from 'react';
import './componentCss/SpeechFooter.css'

const SpeechFooter = ({speech, response, speechColour, responseColour}) => {
    useEffect(() => {
        const speechElement = document.querySelector('.speech p')
        const responseElement = document.querySelector('.response')

        if(speechColour == 0){
            speechElement.style.color = '#e7e7e7'
        } else if (speechColour == 1){
            speechElement.style.color = '#90FF5B'
        } else {
            speechElement.style.color = '#FF5353'
        }

        responseElement.style.backgroundColor = responseColour

        console.log('speechColour', speechColour)
        console.log('responseColour', responseColour)
    },[speechColour, responseColour])
    return (
        <div className="speech-footer">
            <div className="response">
                <p>{response}</p>
            </div>
            <div className="speech">
                <p>{speech}</p>
            </div>
        </div>
    )
}

export default SpeechFooter;