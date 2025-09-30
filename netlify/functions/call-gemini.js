exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Get the data sent from the website
    const { model, payload } = JSON.parse(event.body);
    
    // Securely get the secret API key from Netlify's settings
    const apiKey = process.env.GOOGLE_API_KEY;

    // Check if the API key exists
    if (!apiKey) {
      throw new Error("API key is not set in Netlify's environment variables.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Contact the Google AI API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Handle errors from Google's API
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Google API Error:", errorBody);
        return { statusCode: response.status, body: `Google API Error: ${errorBody}` };
    }

    const data = await response.json();

    // Send the successful response back to the website
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error) {
    // Handle any other errors that happen in the function
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};