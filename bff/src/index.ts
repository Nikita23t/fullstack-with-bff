import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const BACKEND_URL = process.env.BACKEND_URL;

app.get('/api/todos', async (req: Request, res: Response) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/todos`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения данных' });
    }
});

app.put('/api/todos/:id', (req: Request<{ id: string }>, res: Response) => {
    (async () => {
        try {
            const numericId = parseInt(req.params.id, 10);
            if (isNaN(numericId)) {
                return res.status(400).json({ error: 'Некорректный ID' });
            }

            const { completed } = req.body;
            if (typeof completed !== 'boolean') {
                return res.status(400).json({ error: 'Некорректный формат данных' });
            }

            const response = await axios.put(`${BACKEND_URL}/todos/${numericId}`, { completed });

            console.log(`Чекбокс задачи ${numericId} обновлен: ${completed}`);
            res.json(response.data);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка обновления задачи' });
        }
    })();
});




app.post('/api/todos', async (req: Request, res: Response) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/todos`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка создания' });
    }
});

app.listen(PORT, () => {
    console.log(`BFF стартанул http://localhost:${PORT}`);
});
