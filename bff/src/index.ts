import express from 'express'
import cors from 'cors'
import axios from 'axios'
import 'dotenv/config';

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT;
const BACKEND_URL = process.env.BACKEND_URL

app.get('/api/todos', async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/todos`)
        res.json(response.data)
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения данных' })
    }
})

app.post('/api/todos', async (req, res) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/todos`, req.body)
        res.json(response.data)
    } catch (error) {
        res.status(500).json({ error: 'Ошибка создания' })
    }
})

app.listen(PORT, () => {
    console.log(`бфф стартанул http://localhost:${PORT}`)
})