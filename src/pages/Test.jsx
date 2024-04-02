import React, { useState } from "react";
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';

const Test = () => {
  const [isRecording, setIsRecording] = useState(false);

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

  return (
    <section>
      <AudioRecorder 
        onRecordingComplete={addAudioElement}
        audioTrackConstraints={{
          noiseSuppression: true,
          echoCancellation: true,
        }} 
        downloadOnSavePress={true}
        downloadFileExtension="webm"
        record={isRecording}
        recorderControls={recorderControls}
      />
      <div>
        <button onClick={startRecording} disabled={isRecording}>
          Start Recording
        </button>
        <button onClick={stopRecording} disabled={!isRecording}>
          Stop Recording
        </button>
      </div>
    </section>
  );
};

export default Test;
