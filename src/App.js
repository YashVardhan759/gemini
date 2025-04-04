const sendMessage = async (e) => {
  e.preventDefault();
  if (!prompt.trim()) return;
  if (!savedApiKey) {
    alert('Please save your API key first.');
    return;
  }

  // Add user message to chat
  const userMessage = { role: 'user', content: prompt };
  setMessages(prev => [...prev, userMessage]);
  
  // Clear input and show loading state
  setPrompt('');
  setLoading(true);

  try {
    console.log('Sending request to function...');
    const response = await fetch('/.netlify/functions/gemini-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        apiKey: savedApiKey,
        model: model
      }),
    });

    console.log('Response status:', response.status);
    
    // Get the response text first for debugging
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    // Then try to parse it as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error(`Failed to parse response: ${responseText.substring(0, 100)}...`);
    }
    
    if (!response.ok) {
      throw new Error(data.error || `Error from server: ${response.status}`);
    }

    // Extract the response text from Gemini API response
    const assistantResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    
    // Add assistant message to chat
    const assistantMessage = { role: 'assistant', content: assistantResponse };
    setMessages(prev => [...prev, assistantMessage]);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    // Add error message to chat
    const errorMessage = { 
      role: 'system', 
      content: `Error: ${error.message || 'Unknown error occurred'}`
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setLoading(false);
  }
};

// export default App;