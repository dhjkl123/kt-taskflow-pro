const fs = require('fs');
const path = require('path');

// uuid 함수
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const DB_FILE = path.join(__dirname, '../../taskflow.json');

// DB 초기화
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = { tasks: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
}

// DB 읽기
function readDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { tasks: [] };
  }
}

// DB 쓰기
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Task 생성
function createTask(taskData) {
  const db = readDB();
  const task = {
    id: generateId(),
    title: taskData.title,
    description: taskData.description || null,
    status: taskData.status || 'todo',
    due_at: taskData.due_at || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.tasks.push(task);
  writeDB(db);
  return task;
}

// Task 목록 조회 (description 제외)
function listTasks() {
  const db = readDB();
  return db.tasks.map(task => ({
    id: task.id,
    title: task.title,
    status: task.status,
    due_at: task.due_at,
    created_at: task.created_at,
    updated_at: task.updated_at
  }));
}

// Task 단건 조회 (description 포함)
function getTask(id) {
  const db = readDB();
  return db.tasks.find(task => task.id === id);
}

// Task 수정
function updateTask(id, updates) {
  const db = readDB();
  const taskIndex = db.tasks.findIndex(task => task.id === id);
  if (taskIndex === -1) return null;

  const task = db.tasks[taskIndex];
  if (updates.title) task.title = updates.title;
  if (updates.description !== undefined) task.description = updates.description;
  if (updates.status) task.status = updates.status;
  if (updates.due_at !== undefined) task.due_at = updates.due_at;
  task.updated_at = new Date().toISOString();

  db.tasks[taskIndex] = task;
  writeDB(db);
  return task;
}

// Task 삭제
function deleteTask(id) {
  const db = readDB();
  const taskIndex = db.tasks.findIndex(task => task.id === id);
  if (taskIndex === -1) return false;

  db.tasks.splice(taskIndex, 1);
  writeDB(db);
  return true;
}

// DB 초기화
initDB();

module.exports = {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask
};
