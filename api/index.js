const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const db = require('./db');

// 미들웨어
app.use(cors());
app.use(express.json());

// 입력 검증
function validateTask(data) {
  if (!data.title || data.title.trim() === '') {
    return { valid: false, error: 'title은 필수입니다' };
  }
  if (data.title.length > 200) {
    return { valid: false, error: 'title은 200자 이하여야 합니다' };
  }
  if (data.status && !['todo', 'in_progress', 'done'].includes(data.status)) {
    return { valid: false, error: 'status는 todo, in_progress, done 중 하나여야 합니다' };
  }
  if (data.due_at) {
    try {
      new Date(data.due_at);
    } catch (err) {
      return { valid: false, error: 'due_at는 ISO 8601 형식이어야 합니다' };
    }
  }
  return { valid: true };
}

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// API 루트
app.get('/', (req, res) => {
  res.json({ message: 'TaskFlow Pro API' });
});

// POST /api/tasks - 업무 추가 (201)
app.post('/api/tasks', async (req, res) => {
  const validation = validateTask(req.body);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }

  try {
    const task = await db.createTask(req.body);
    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/tasks - 업무 목록 (200, description 제외)
app.get('/api/tasks', async (req, res) => {
  try {
    const items = await db.listTasks();
    res.json({ items, count: items.length });
  } catch (err) {
    console.error('Error listing tasks:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/tasks/:id - 업무 단건 조회 (200, description 포함)
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await db.getTask(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    console.error('Error getting task:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/tasks/:id - 업무 수정 (200, 부분 수정)
app.put('/api/tasks/:id', async (req, res) => {
  // 부분 수정이므로 title이 제공되는 경우에만 검증
  if (req.body.title !== undefined) {
    if (!req.body.title || req.body.title.trim() === '') {
      return res.status(400).json({ error: 'title은 필수입니다' });
    }
    if (req.body.title.length > 200) {
      return res.status(400).json({ error: 'title은 200자 이하여야 합니다' });
    }
  }

  if (req.body.status && !['todo', 'in_progress', 'done'].includes(req.body.status)) {
    return res.status(400).json({ error: 'status는 todo, in_progress, done 중 하나여야 합니다' });
  }

  if (req.body.due_at) {
    try {
      new Date(req.body.due_at);
    } catch (err) {
      return res.status(400).json({ error: 'due_at는 ISO 8601 형식이어야 합니다' });
    }
  }

  try {
    const task = await db.updateTask(req.params.id, req.body);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/tasks/:id - 업무 삭제 (204)
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const deleted = await db.deleteTask(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Vercel Serverless Functions export
module.exports = app;
