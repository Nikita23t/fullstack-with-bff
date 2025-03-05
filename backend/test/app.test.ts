import request from 'supertest';
import { AppDataSource } from '../src/index';
import { Todo } from '../src/entity/Todo';
import { initializeApp, getApp } from '../src/index';
import { Server } from 'http';

let app: ReturnType<typeof getApp> | null;
let server: Server;

beforeAll(async () => {
  await initializeApp();
  app = getApp();

  if (!app) {
    throw new Error("Failed to initialize app");
  }

  server = app.listen();
});

afterAll(async () => {
  if (server) {
    server.close();
  }
  await AppDataSource.destroy();
});

describe('API Tests', () => {
  it('should test endpoint', async () => {
    if (!app) throw new Error("App is not initialized");
  });
});

jest.mock('typeorm', () => {
  const actual = jest.requireActual('typeorm');
  return {
    ...actual,
    DataSource: jest.fn().mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(null),
      destroy: jest.fn().mockResolvedValue(null), 
      getRepository: jest.fn().mockReturnValue({
        find: jest.fn(),
        findOneBy: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
      }),
    })),
  };
});

describe('Todo API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/todos', () => {
    it('should return all todos', async () => {
      if (!app) throw new Error("App is not initialized");

      const mockTodos = [{ id: 1, title: 'Test', completed: false }];
      (AppDataSource.getRepository(Todo).find as jest.Mock).mockResolvedValue(mockTodos);

      const res = await request(app).get('/api/todos');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockTodos);
      expect(AppDataSource.getRepository(Todo).find).toHaveBeenCalled();
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should return 400 for invalid ID', async () => {
      if (!app) throw new Error("App is not initialized");

      const res = await request(app).get('/api/todos/invalid');
      expect(res.status).toBe(400);
    });

    it('should return 404 if todo not found', async () => {
      if (!app) throw new Error("App is not initialized");

      (AppDataSource.getRepository(Todo).findOneBy as jest.Mock).mockResolvedValue(null);
      const res = await request(app).get('/api/todos/999');
      expect(res.status).toBe(404);
    });

    it('should return todo', async () => {
      if (!app) throw new Error("App is not initialized");

      const mockTodo = { id: 1, title: 'Test', completed: false };
      (AppDataSource.getRepository(Todo).findOneBy as jest.Mock).mockResolvedValue(mockTodo);

      const res = await request(app).get('/api/todos/1');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockTodo);
    });
  });

  describe('POST /api/todos', () => {
    it('should create new todo', async () => {
      if (!app) throw new Error("App is not initialized");

      const mockTodo = { id: 1, title: 'New Todo', completed: false };
      (AppDataSource.getRepository(Todo).save as jest.Mock).mockResolvedValue(mockTodo);

      const res = await request(app)
        .post('/api/todos')
        .send({ title: 'New Todo' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockTodo);
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update todo', async () => {
      if (!app) throw new Error("App is not initialized");

      const mockTodo = { id: 1, title: 'Test', completed: true };
      (AppDataSource.getRepository(Todo).findOneBy as jest.Mock).mockResolvedValue(mockTodo);
      (AppDataSource.getRepository(Todo).save as jest.Mock).mockResolvedValue(mockTodo);

      const res = await request(app)
        .put('/api/todos/1')
        .send({ completed: true });

      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(true);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete todo', async () => {
      if (!app) throw new Error("App is not initialized");

      (AppDataSource.getRepository(Todo).findOneBy as jest.Mock).mockResolvedValue({ id: 1 });
      (AppDataSource.getRepository(Todo).delete as jest.Mock).mockResolvedValue({ affected: 1 });

      const res = await request(app).delete('/api/todos/1');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Задача удалена');
    });
  });
});
