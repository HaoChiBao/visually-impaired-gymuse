import './componentCss/SpeechFooter.css'

const SpeechFooter = ({speech, response}) => {
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