import './css/Register.css';
import { useState, useEffect } from 'react';

// components
import SpeakerBubble from '../components/SpeakerBubble';

import System from '../auth/system';

const Register = () => {
    return (
        <div className="Register">
            <div className="top">
                <SpeakerBubble/>
            </div>
            <div className="bottom">
                <p>Hello</p>
            </div>
        </div>
    )
}

export default Register;