import "reflect-metadata"
import { DataSource } from "typeorm"
import express, { Request, Response, Express } from 'express'
import { Todo } from "./entity/Todo"
import cors from 'cors'
import 'dotenv/config';

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.HOST,
    port: Number(process.env.PORT_DB),
    username: process.env.USER,
    password: process.env.PW,
    database: process.env.DB,
    entities: [Todo],
    synchronize: true,
});

let app: Express | null = null;
let server: ReturnType<Express['listen']> | null = null;

export const initializeApp = async () => {
    await AppDataSource.initialize();

    app = express();
    app.use(express.json());
    app.use(cors({
        origin: 'http://localhost:3002',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }));


    app.get('/api/todos/:id', async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id, 10);

            if (isNaN(id)) {
                res.status(400).json({ message: 'Некорректный ID' });
                return;
            }

            const todo = await AppDataSource.getRepository(Todo).findOneBy({ id });

            if (!todo) {
                res.status(404).json({ message: 'Задача не найдена' });
                return;
            }

            console.log("бэк вывод одного");
            res.json(todo);
        } catch (error) {
            console.error("Ошибка при получении задачи:", error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    });


    app.get('/api/todos', async (_: Request, res: Response) => {
        const todos = await AppDataSource.getRepository(Todo).find()
        console.log("бэк вывод всего")
        res.json(todos)
    })

    app.put('/api/todos/:id', async (req: Request, res: Response): Promise<any> => {
        const id = parseInt(req.params.id);
        const { completed } = req.body;
        const todos = await AppDataSource.getRepository(Todo).findOneBy({ id })
        if (!todos) {
            return res.status(404).json({ message: 'Задача не найдена' });
        }
        todos.completed = completed
        await AppDataSource.getRepository(Todo).save(todos)
        console.log("бэк изменение статуса задачи")
        res.json(todos)
    })

    app.delete('/api/todos/:id', async (req: Request, res: Response): Promise<any> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({ message: 'Некорректный ID' });
            }

            const todo = await AppDataSource.getRepository(Todo).findOneBy({ id });

            if (!todo) {
                return res.status(404).json({ message: 'Задача не найдена' });
            }

            await AppDataSource.getRepository(Todo).delete(id);

            console.log("бэк удаление");
            res.json({ message: 'Задача удалена', id });
        } catch (error) {
            console.error("Ошибка при удалении:", error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    });


    app.post('/api/todos', async (req: Request, res: Response) => {
        const todo = new Todo()
        todo.title = req.body.title
        const result = await AppDataSource.getRepository(Todo).save(todo)
        console.log("бэк создание")
        res.json(result)
    })

    server = app.listen(process.env.PORT, () => {
        console.log(`Server started on http://localhost:${process.env.PORT}`);
    });

    return { app, server };
};

// Экспорт для тестов
export const getApp = () => app;
export const getServer = () => server;