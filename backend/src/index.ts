import "reflect-metadata" 
import { DataSource } from "typeorm"
import express, { Request, Response } from 'express'
import { Todo } from "./entity/Todo" 
import cors from 'cors'
import 'dotenv/config';


const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.HOST,
    port: Number(process.env.PORT_DB),
    username: process.env.USER,
    password: process.env.PW,
    database: process.env.DB,
    entities: [Todo],
    synchronize: true,
})

AppDataSource.initialize()
    .then(() => {
        const app = express()
        app.use(express.json())
        app.use(cors());
        const port = process.env.PORT;

        app.get('/api/todos', async (req: Request, res: Response) => {
            const todos = await AppDataSource.getRepository(Todo).find()
            res.json(todos)
        })

        app.put('/api/todos/:id', async (req: Request, res: Response): Promise<any> => {
            const id = parseInt(req.params.id);
            const { completed } = req.body;
            const todos = await AppDataSource.getRepository(Todo).findOneBy({id})
            if (!todos) {
                return res.status(404).json({ message: 'Задача не найдена' });
            }
                todos.completed = completed
                await AppDataSource.getRepository(Todo).save(todos)
                res.json(todos)
        })

        app.post('/api/todos', async (req: Request, res: Response) => {
            const todo = new Todo()
            todo.title = req.body.title
            const result = await AppDataSource.getRepository(Todo).save(todo)
            res.json(result)
        })

        app.listen(port, () => {
            console.log(`бэк стартанул http://localhost:${port}`)
        })
    })
    .catch((error) => console.log(error))