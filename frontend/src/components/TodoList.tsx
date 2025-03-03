import React from 'react'
import { useState, useEffect } from 'react'

interface Todo {
    id: number
    title: string
    completed: boolean
    createdAt: string
}

export default function TodoList() {
    const [todos, setTodos] = useState<Todo[]>([])
    const [newTodo, setNewTodo] = useState('')
    const API_URL = process.env.REACT_APP_API_BASE_URL

    useEffect(() => {
        fetch(`${API_URL}/todos`)
            .then(res => res.json())
            .then(data => setTodos(data))
    }, [API_URL])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTodo })
        })
            .then(res => res.json())
            .then(data => {
                setTodos([...todos, data])
                setNewTodo('')
            })
    }

    const handleToggle = (id: number, completed: boolean) => {
        fetch(`${API_URL}/todos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        })
            .then(res => res.json())
            .then(updatedTodo => {
                setTodos(todos.map(todo => 
                    todo.id === id ? { ...todo, completed: updatedTodo.completed } : todo
                ))
            })
    }

    return (
        <div className="todo-container">
            <h1>Todo List</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="добавить запись"
                />
                <button type="submit">добавить</button>
            </form>
            <ul>
                {todos.length === 0 ? (
                    <div>пусто</div>
                ) : (
                    todos.map(todo => (
                        <li key={todo.id}>
                            {todo.title}
                            <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={(e) => handleToggle(todo.id, e.target.checked)}
                            />
                            <button type="submit">удалить</button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    )
}