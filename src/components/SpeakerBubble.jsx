import './componentCss/SpeakerBubble.css'
import Speaker from '../images/speaking2.png'

const SpeakerBubble = () => {
    return (
        <div className="speakerBubble">
            <div className="inner">
                <img src={Speaker} alt="" />
            </div>
        </div>
    )
}

export default SpeakerBubble;