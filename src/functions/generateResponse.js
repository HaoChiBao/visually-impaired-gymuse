const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY

const generateResponse = async (chatHistory) => {
    const copyChatHistory = [...chatHistory]
    // copyChatHistory.push({role: 'user', content: text + contentAdd})

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,

        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: copyChatHistory,
            max_tokens: 100,
            temperature: 0.2,
            // stop: ['\n', 'User:', 'Assistant:'],
        })
    })
    if (!response.ok) {
      throw new Error(`Failed to generate response. Status: ${response.status}`);
    }
    const data = await response.json();
    const content = data.choices[0].message.content
    copyChatHistory.push({role: 'system', content})
    return [content, copyChatHistory]
}

export default generateResponse