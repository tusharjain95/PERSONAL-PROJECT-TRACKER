import React, { useState } from 'react';
import { Plus, MoreHorizontal, Layers } from 'lucide-react';
import { Task, KanbanColumnDef, ColumnStatus } from '../types';
import { TaskCard } from './TaskCard';

interface KanbanColumnProps {
  column: KanbanColumnDef;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onMoveTask: (taskId: string, newStatus: ColumnStatus) => void;
  onAddTaskToColumn: (status: ColumnStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  onSelectTask,
  onMoveTask,
  onAddTaskToColumn,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onMoveTask(taskId, column.id);
    }
  };

  const totalMilestonesInColumn = tasks.reduce(
    (acc, t) => acc + (t.milestones ? t.milestones.length : 0), 
    0
  );
  const completedMilestonesInColumn = tasks.reduce(
    (acc, t) => acc + (t.milestones ? t.milestones.filter(m => m.completed).length : 0), 
    0
  );

  return (
    <div
      id={`kanban-column-${column.id}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col flex-1 min-w-[280px] sm:min-w-[310px] max-w-[380px] bg-slate-100/70 rounded-2xl p-3 border ${
        isDragOver ? 'border-indigo-400 bg-indigo-50/50 ring-2 ring-indigo-200' : 'border-slate-200/80'
      } transition-all`}
    >
      {/* Column Header */}
      <div className="flex items-start justify-between gap-2 px-1 py-1 mb-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${column.accent}`} />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {column.title}
            </h3>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${column.badgeBg}`}>
              {tasks.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 line-clamp-1">
            {column.description}
          </p>
        </div>

        <button
          id={`add-task-${column.id}-btn`}
          onClick={() => onAddTaskToColumn(column.id)}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 shadow-2xs transition-colors"
          title={`Add task to ${column.title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Milestone tally indicator for this column */}
      {totalMilestonesInColumn > 0 && (
        <div className="mx-1 mb-2 px-2.5 py-1 rounded-md bg-white/70 border border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600 font-medium">
          <span>Column Milestones:</span>
          <span className="font-mono font-semibold text-slate-800">
            {completedMilestonesInColumn}/{totalMilestonesInColumn} completed
          </span>
        </div>
      )}

      {/* Column Tasks List */}
      <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5 custom-scrollbar min-h-[120px]">
        {tasks.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', task.id);
            }}
          >
            <TaskCard
              task={task}
              onSelectTask={onSelectTask}
              onMoveTask={onMoveTask}
            />
          </div>
        ))}

        {tasks.length === 0 && (
          <div 
            onClick={() => onAddTaskToColumn(column.id)}
            className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300/80 rounded-xl bg-white/40 hover:bg-white/80 hover:border-indigo-300 text-slate-400 hover:text-indigo-600 transition-all cursor-pointer group"
          >
            <Plus className="w-5 h-5 mb-1 text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">No tasks in {column.title}</span>
            <span className="text-[11px] text-slate-400">Click to add task</span>
          </div>
        )}
      </div>

      {/* Bottom Quick Add Button */}
      <button
        onClick={() => onAddTaskToColumn(column.id)}
        className="mt-2.5 w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded-xl border border-transparent hover:border-slate-200 transition-all flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Task</span>
      </button>
    </div>
  );
};
