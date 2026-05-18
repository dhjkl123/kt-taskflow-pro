import TaskCard from './TaskCard';

export default function TaskList({ tasks, onDelete, onUpdate }) {
  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done'),
  };

  const statusLabels = {
    todo: '할 일',
    in_progress: '진행 중',
    done: '완료',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
        <div key={status} className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {statusLabels[status]}
          </h3>
          <div className="space-y-3">
            {statusTasks.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">업무 없음</p>
            ) : (
              statusTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
