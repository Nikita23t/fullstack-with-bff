import "reflect-metadata" 
import { DataSource } from "typeorm"
import express, { Request, Response } from 'express'
import { Todo } from "./entity/Todo" 
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
        const port = process.env.PORT;

        app.get('/todos', async (req: Request, res: Response) => {
            const todos = await AppDataSource.getRepository(Todo).find()
            res.json(todos)
        })

        app.post('/todos', async (req: Request, res: Response) => {
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