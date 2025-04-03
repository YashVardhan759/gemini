const axios = require('axios');
require('dotenv').config();

exports.handler = async function(event, context) {
  // Add console logging for debugging
  console.log('Function called');
  console.log('HTTP Method:', event.httpMethod);

  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Only proceed if request is POST
    if (event.httpMethod !== 'POST') {
      return { 
        statusCode: 405, 
        body: JSON.stringify({ error: 'Method Not Allowed' }) 
      };
    }

    console.log('Parsing body');
    const payload = JSON.parse(event.body);
    const { prompt, apiKey, model } = payload;
    
    console.log('Validating inputs');
    console.log('Model:', model);
    // Don't log the full API key for security
    console.log('API Key provided:', apiKey ? 'Yes' : 'No');
    console.log('Prompt provided:', prompt ? 'Yes' : 'No');

    if (!apiKey) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'API Key is required' })
      };
    }

    if (!prompt) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Prompt is required' })
      };
    }

    // Determine which model to use, default to gemini-pro
    const geminiModel = model || 'gemini-pro';
    
    // Construct the Gemini API URL
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;
    
    console.log('Sending request to Gemini API');
    // Prepare request to Gemini API
    const response = await axios.post(apiUrl, {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    });

    console.log('Received response from Gemini API');
    // Return the response from Gemini
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Error in function:', error.message);
    if (error.response) {
      console.error('API response error:', error.response.status, error.response.statusText);
      console.error('Error data:', JSON.stringify(error.response.data));
    }
    
    return {
      statusCode: error.response?.status || 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: error.response?.data || 'Internal Server Error',
        message: error.message
      })
    };
  }
};