import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import 'dotenv/config';

const app = express();
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }));
app.use(express.json());

const PORT = process.env.PORT || 5000;
const BACKEND_URL = process.env.BACKEND_URL;

app.get('/api/todos', async (_: Request, res: Response) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/todos`);
        console.log("бфф вывод всего")
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения данных' });
    }
});

app.get('/api/todos/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        
        if (isNaN(id)) {
            res.status(400).json({ error: 'Некорректный ID' });
            return;
        }

        try {
            const response = await axios.get(`${BACKEND_URL}/todos/${id}`);
            console.log('BFF: Proxy delete successful:', response.data);
            res.json(response.data);
        } catch (error: any) {
            if (error?.response?.status === 404) {
                res.status(404).json({ error: 'Задача не найдена' });
                return;
            }
            throw error;
        }

    } catch (error: any) {
        console.error('BFF: Proxy delete error:', error?.response?.data || error.message);
        res.status(500).json({ error: 'Ошибка удаления задачи' });
    }
});

app.put('/api/todos/:id', (req: Request, res: Response) => {
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

app.delete('/api/todos/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const id = Number(req.params.id);
        
        if (isNaN(id)) {
            res.status(400).json({ error: 'Некорректный ID' });
            return;
        }

        try {
            await axios.get(`${BACKEND_URL}/todos/${id}`);
        } catch (error: any) {
            if (error?.response?.status === 404) {
                res.status(404).json({ error: 'Задача не найдена' });
                return;
            }
            throw error;
        }

        const response = await axios.delete(`${BACKEND_URL}/todos/${id}`);
        console.log('BFF: Proxy delete successful:', response.data);

        res.json(response.data);

    } catch (error: any) {
        console.error('BFF: Proxy delete error:', error?.response?.data || error.message);
        res.status(500).json({ error: 'Ошибка удаления задачи' });
    }
});




app.post('/api/todos', async (req: Request, res: Response) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/todos`, req.body);
        console.log("бфф создание")
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка создания' });
    }
});

app.listen(PORT, () => {
    console.log(`BFF стартанул http://localhost:${PORT}`);
});
