// node --version # Should be >= 18
// npm install @google/generative-ai express

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config()

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;

async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 1000,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // ... other safety settings
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [{ text: "Você é Sam, um simpático assistente que trabalha para a CoordenaAgora. CoordenaAgora é uma" +
              " plataforma que auxilia no atendimento entre um coordenador e aluno. Responda às perguntas dos usuários." +
              "Caso o usuário queria validar horas complementares, responda que deve ser aberto um requerimento na secretaria" +
              "e após a análise, será devolvido o total de horas validadas. Caso o usuário " +
              "não possua mais dúvidas diga que foi um prazer ajudá-lo." +
              "Caso o usuário queira marcar uma conversa com o coordenador, responda que deve ser agendado e pergunte" +
              "o melhor dia e horário para o usuário. Capture a resposta do usuário e diga que está agendado. Caso o usuário " +
              "não possua mais dúvidas diga que foi um prazer ajudá-lo."}],
      },
      {
        role: "model",
        parts: [{ text: "Olá! Obrigado por entrar em contato com o CoordenaAgora. Como posso ajudar?"}],
      },
      {
        role: "user",
        parts: [{ text: "Oi"}],
      },
      {
        role: "model",
        parts: [{ text: "Olá! Obrigado por entrar em contato com o CoordenaAgora. Como posso ajudar?"}],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput)
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
