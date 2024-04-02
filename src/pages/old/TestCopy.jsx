import React, { useState, useRef, useEffect } from 'react';

import generateText from '../functions/generateText';

function Test() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorder = useRef(null);
  const [startTime, setStartTime] = useState(0);

  const [transcript, setTranscript] = useState('...')

  useEffect(() => {
    if (audioBlob) {
      generateText(audioBlob)
        .then((text) => {
          console.log('Transcribed text:', text);
          setTranscript(text)
        })
        .catch((err) => {
          console.error('Error transcribing audio:', err);
        });
    }
  }, [audioBlob]);

  const startRecording = () => {
    setStartTime(Date.now());
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorder.current = new MediaRecorder(stream);
        const chunks = [];
        mediaRecorder.current.ondataavailable = (e) => {
          chunks.push(e.data);
        };
        mediaRecorder.current.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          setAudioBlob(blob);
        };
        mediaRecorder.current.start();
        setRecording(true);
      })
      .catch((err) => {
        console.error('Error accessing microphone: ', err);
      });
  };

  const stopRecording = () => {
    console.log('Recording duration:', Date.now() - startTime);
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  const playAudio = () => {
    if (audioBlob) {
      const audioURL = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioURL);
      audio.play();
    }
  };

  return (
    <div>
      <h1>Audio Recorder</h1>
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <button onClick={playAudio} disabled={!audioBlob}>
        Play Recorded Audio
      </button>
      <p>{transcript}</p>
    </div>
  );
}

export default Test;
