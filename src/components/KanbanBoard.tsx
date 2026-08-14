import React from 'react';
import { ColumnStatus, KanbanColumnDef, Task, Project } from '../types';
import { KANBAN_COLUMNS } from '../data/initialData';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  tasks: Task[];
  project: Project | undefined;
  onSelectTask: (task: Task) => void;
  onMoveTask: (taskId: string, newStatus: ColumnStatus) => void;
  onAddTaskToColumn: (status: ColumnStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  project,
  onSelectTask,
  onMoveTask,
  onAddTaskToColumn,
}) => {
  return (
    <div id="kanban-board-container" className="w-full">
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 px-1 custom-scrollbar snap-x">
        {KANBAN_COLUMNS.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.id);
          return (
            <div key={column.id} className="snap-start">
              <KanbanColumn
                column={column}
                tasks={columnTasks}
                onSelectTask={onSelectTask}
                onMoveTask={onMoveTask}
                onAddTaskToColumn={onAddTaskToColumn}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
