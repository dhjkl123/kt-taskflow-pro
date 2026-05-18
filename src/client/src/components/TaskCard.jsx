import { useState } from 'react';

export default function TaskCard({ task, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    status: task.status,
  });

  const handleStatusChange = (newStatus) => {
    onUpdate(task.id, { status: newStatus });
  };

  const handleDelete = () => {
    if (confirm(`"${task.title}"을 삭제하시겠습니까?`)) {
      onDelete(task.id);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {task.title}
          </h4>
          {task.due_at && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              마감: {formatDate(task.due_at)}
            </p>
          )}
        </div>

        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
        >
          <option value="todo">할 일</option>
          <option value="in_progress">진행</option>
          <option value="done">완료</option>
        </select>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleDelete}
          className="flex-1 text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition"
        >
          삭제
        </button>
      </div>
    </div>
  );
}
