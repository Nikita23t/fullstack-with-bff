import React, { useState, useEffect } from 'react';

interface Todo {
    id: number;
    title: string;
    completed: boolean;
    createdAt: string;
}

export default function TodoList() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState('');
    const [searchId, setSearchId] = useState('');
    const [searchedTodo, setSearchedTodo] = useState<Todo | null>(null);
    const API_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        console.log("фронт вывод всего");
        fetch(`${API_URL}/todos`)
            .then(res => res.json())
            .then(data => setTodos(data));
    }, [API_URL]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("фронт согласить принять");
        fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTodo }),
        })
            .then(res => res.json())
            .then(data => {
                setTodos([...todos, data]);
                setNewTodo('');
            });
    };

    const handleToggle = (id: number, completed: boolean) => {
        console.log("фронт изменение");
        fetch(`${API_URL}/todos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed }),
        })
            .then(res => res.json())
            .then(updatedTodo => {
                setTodos(todos.map(todo =>
                    todo.id === id ? { ...todo, completed: updatedTodo.completed } : todo
                ));
            });
    };

    const handleDelete = (id: number) => {
        console.log('Deleting todo with ID:', id);
        fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(res => {
                console.log('Delete response status:', res.status);
                if (res.ok) {
                    setTodos(todos.filter(todo => todo.id !== id));
                } else {
                    console.error('Delete failed:', res.statusText);
                }
            })
            .catch(error => console.error('Error deleting todo:', error));
    };

    const handleSearch = () => {
        console.log('Searching for todo with ID:', searchId);
        if (!searchId) return;
        
        fetch(`${API_URL}/todos/${searchId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(res => {
                if (!res.ok) throw new Error('Задача не найдена');
                return res.json();
            })
            .then(data => {
                setSearchedTodo(data);
            })
            .catch(error => {
                console.error(error);
                setSearchedTodo(null);
            });
    };

    return (
        <div className="todo-container">
            <h1>Todo List</h1>

            {/* Форма добавления */}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Добавить запись"
                />
                <button type="submit">Добавить</button>
            </form>

            {/* Форма поиска */}
            <div>
                <input
                    type="number"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Введите ID для поиска"
                />
                <button onClick={handleSearch}>Найти</button>
            </div>

            {/* Вывод найденной задачи */}
            {searchedTodo && (
                <div>
                    <h3>Найденная задача:</h3>
                    <p><strong>ID:</strong> {searchedTodo.id}</p>
                    <p><strong>Название:</strong> {searchedTodo.title}</p>
                    <p><strong>Выполнено:</strong> {searchedTodo.completed ? 'Да' : 'Нет'}</p>
                </div>
            )}

            {/* Вывод списка */}
            <ul>
                {todos.length === 0 ? (
                    <div>Пусто</div>
                ) : (
                    todos.map(todo => (
                        <li key={todo.id}>
                            <p>{todo.id}.  </p>
                            {todo.title}
                            <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={(e) => handleToggle(todo.id, e.target.checked)}
                            />
                            <button
                                type="button"
                                onClick={() => handleDelete(todo.id)}
                            >
                                Удалить
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
