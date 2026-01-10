require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const ChatSchema = new mongoose.Schema({
    prompt: String,
    response: String,
    createdAt: { type: Date, default: Date.now }
});

const Chat = mongoose.model('Chat', ChatSchema);

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
});

app.post('/api/ask-ai', async (req, res) => {
    const { prompt } = req.body;

    try {
        const completion = await openai.chat.completions.create({
            model:"mistralai/mistral-7b-instruct:free",
            messages: [
                {role: "user", content: prompt }
            ],
        });

        const aiResponse = completion.choices[0].message.content;
        res.json({ answer: aiResponse });

    } catch (error){
        console.error(error)
        res.status(500).json({error: "AI fetch failed" })
    }
});

app.post('/api/save', async (req, res) => {
    const { prompt, response } =req.body;
    try {
        const newChat = new Chat({ prompt, response });
        await newChat.save();
        res.json({ message: "Saved successfully!", data: newChat });
    } catch (error) {
        res.status(500).json({error: "Save failed" });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))