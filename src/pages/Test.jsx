import React, { useState, useRef, useEffect } from 'react';

import generateText from '../functions/generateText';
import { ReactMic } from 'react-mic';

const Test = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [blobURL, setBlobURL] = useState('');

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const onData = recordedBlob => {
    console.log('chunk of real-time data is: ', recordedBlob);
  };

  const onStop = recordedBlob => {
    console.log('recordedBlob is: ', recordedBlob);
    setBlobURL(recordedBlob.blobURL);
  };
  // hellooo

  return (
    <div>
      <h1>Audio Recorder</h1>
      <ReactMic
        record={isRecording}
        className="sound-wave"
        onStop={onStop}
        onData={onData}
        mimeType="audio/wav"
      />
      <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>
      {blobURL && (
        <div>
          <h2>Recorded Audio:</h2>
          <audio controls src={blobURL}></audio>
        </div>
      )}
    </div>
  );
};

export default Test;
