const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// UUID 생성 함수
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// DB 초기화 (테이블 생성)
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'todo',
        due_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized');
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
}

// Task 생성
async function createTask(taskData) {
  const id = generateId();
  const now = new Date().toISOString();

  try {
    const result = await pool.query(
      `INSERT INTO tasks (id, title, description, status, due_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        id,
        taskData.title,
        taskData.description || null,
        taskData.status || 'todo',
        taskData.due_at || null,
        now,
        now
      ]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Failed to create task:', err);
    throw err;
  }
}

// Task 목록 조회 (description 제외)
async function listTasks() {
  try {
    const result = await pool.query(
      `SELECT id, title, status, due_at, created_at, updated_at
       FROM tasks
       ORDER BY created_at DESC`
    );
    return result.rows;
  } catch (err) {
    console.error('Failed to list tasks:', err);
    throw err;
  }
}

// Task 단건 조회 (description 포함)
async function getTask(id) {
  try {
    const result = await pool.query(
      `SELECT * FROM tasks WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error('Failed to get task:', err);
    throw err;
  }
}

// Task 수정
async function updateTask(id, updates) {
  try {
    let query = 'UPDATE tasks SET updated_at = CURRENT_TIMESTAMP';
    const values = [];
    let paramCount = 1;

    if (updates.title) {
      query += `, title = $${paramCount++}`;
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      query += `, description = $${paramCount++}`;
      values.push(updates.description);
    }
    if (updates.status) {
      query += `, status = $${paramCount++}`;
      values.push(updates.status);
    }
    if (updates.due_at !== undefined) {
      query += `, due_at = $${paramCount++}`;
      values.push(updates.due_at);
    }

    query += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (err) {
    console.error('Failed to update task:', err);
    throw err;
  }
}

// Task 삭제
async function deleteTask(id) {
  try {
    const result = await pool.query(
      `DELETE FROM tasks WHERE id = $1 RETURNING id`,
      [id]
    );
    return result.rows.length > 0;
  } catch (err) {
    console.error('Failed to delete task:', err);
    throw err;
  }
}

// DB 초기화
initDB();

module.exports = {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
  pool
};
