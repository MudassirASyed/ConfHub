require('dotenv').config();
const axios = require("axios");

async function predictDomain(paperTitle, abstract) {
 const prompt = `
Given the following research paper title and abstract, determine the most relevant research domain.
If multiple domains apply, choose the primary one. Return only the domain name.

Title: ${paperTitle}
Abstract: ${abstract}
`;

  // Updated model options (choose one):
  const models = {
    // Production models (recommended for production)
    versatile: "llama-3.3-70b-versatile",    // Best for general tasks, 128K context
    fast: "llama-3.1-8b-instant",           // Faster, good for simple tasks
    legacy: "llama3-70b-8192",               // Legacy option with 8K context
    
    // Preview models (evaluation only)
    preview: "deepseek-r1-distill-llama-70b" // Alternative preview option
  };

  // Choose the model - recommended: versatile for best quality
  let selectedModel = models.versatile;

  let retries = 3;
  while (retries--) {
    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: selectedModel,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 50, // Since we only need a domain name
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const predictedDomain = response.data.choices[0].message.content.trim();
      console.log(`Domain predicted using model ${selectedModel}:`, predictedDomain);
      return predictedDomain;
    } catch (error) {
      if (error.response?.status === 429 && retries > 0) {
        console.warn("Rate limited by Groq. Retrying in 3 seconds...");
        await new Promise((res) => setTimeout(res, 3000));
      } else {
        console.error("Groq Error:", error.response?.data || error.message);
        
        // If it's a model error and we have retries left, try a different model
        if (error.response?.data?.error?.code === 'model_decommissioned' && retries > 0) {
          console.warn("Model decommissioned, trying fallback model...");
          selectedModel = models.fast; // Fallback to faster model
          continue;
        }
        break;
      }
    }
  }

  return "Unknown";
}

module.exports = { predictDomain };