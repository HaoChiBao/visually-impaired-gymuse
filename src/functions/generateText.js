import axios from "axios";

const apiKey = process.env.REACT_APP_OPENAI_API_KEY
const apiUrl = `https://api.openai.com/v1/audio/transcriptions`;
const model = 'whisper-1';

const generateText = async (audioBlob) => {
    const formData = new FormData();
    formData.append('model', model);
    formData.append('file', audioBlob);

    try {
        const response = await axios.post(apiUrl, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${apiKey}`
            }
        });
        console.log(response)
        return response.data.text;
    } catch (err){
        return err
    }

};

export default generateText;