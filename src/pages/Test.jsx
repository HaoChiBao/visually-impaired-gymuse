import React, { useState } from "react";
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import generateText from '../functions/generateText';
import './css/Test.css';
const Test = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('...'); // stores the text generated from STT

  const recorderControls = useAudioRecorder();

  const addAudioElement = (blob) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    document.body.appendChild(audio);
  };

  const startRecording = () => {
    setIsRecording(true);
    recorderControls.startRecording();
  };

  const stopRecording = () => {
    setIsRecording(false);
    recorderControls.stopRecording();
  };

  const handleRecordComplete = (blob) => {
    // convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64data = reader.result;
      const text = await generateText(base64data);
      setTranscript(text);
    };
    addAudioElement(blob);
  }

  return (
    <section>
      <div style={{position:'absolute', opacity: 0, pointerEvents:'none'}}>
        <AudioRecorder 
          onRecordingComplete={handleRecordComplete}
          audioTrackConstraints={{
            noiseSuppression: true,
            echoCancellation: true,
          }} 
          downloadOnSavePress={true}
          downloadFileExtension="webm"
          record={isRecording}
          recorderControls={recorderControls}
        />
      </div>
      <div>
        <button onClick={startRecording} disabled={isRecording}>
          Start Recording
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>
          Stop Recording
        </button>
        <p>{transcript}</p>
      </div>
    </section>
  );
};

export default Test;
