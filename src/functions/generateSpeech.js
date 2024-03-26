const GOOGLE_TTS_KEY = process.env.REACT_APP_GOOGLE_TTS_KEY

let audio = new Audio();

const generateSpeech = async (transcript) => {
  return new Promise(async (resolve, reject) => {
    
    if(!audio.paused) audio.pause();
    const apiUrl = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${GOOGLE_TTS_KEY}`;
    
    const requestBody = JSON.stringify({
      input: { text: transcript },

      voice: { 
        languageCode: 'en-US', 
        name: "en-US-Journey-D"
        // name: "en-US-Studio-O"
      },

      audioConfig: { 
        audioEncoding: 'LINEAR16', 
        // effectsProfileId: ['small-bluetooth-speaker-class-device'],
        pitch: 0,
        speakingRate: 1
      },
    });
  
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });
  
      if (!response.ok) {
        throw new Error(`Failed to generate speech. Status: ${response.status}`);
      }
  
      const data = await response.json();
      const audioContent = data.audioContent;

      audio.src = `data:audio/wav;base64,${audioContent}`;

      await audio.load()
      await audio.play();

      audio.onended = () => {
        resolve(true)
      }

    } catch (err) {
      console.error('Error generating speech:', err.message || err);
      resolve(false)
    }

  })
}

export default generateSpeech;