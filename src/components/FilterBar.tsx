import React from 'react';
import { Search, Filter, X, LayoutGrid, CheckSquare, Sparkles } from 'lucide-react';
import { Priority } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPriority: Priority | 'all';
  onPriorityChange: (priority: Priority | 'all') => void;
  selectedTag: string | 'all';
  onTagChange: (tag: string | 'all') => void;
  availableTags: string[];
  pendingOnly: boolean;
  onPendingOnlyChange: (enabled: boolean) => void;
  currentView: 'kanban' | 'milestones_matrix';
  onViewChange: (view: 'kanban' | 'milestones_matrix') => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  selectedTag,
  onTagChange,
  availableTags,
  pendingOnly,
  onPendingOnlyChange,
  currentView,
  onViewChange,
  onResetFilters,
}) => {
  const hasActiveFilters = searchQuery !== '' || selectedPriority !== 'all' || selectedTag !== 'all' || pendingOnly;

  return (
    <div id="filter-bar" className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-5">
      {/* Search and Filters Left Group */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="task-search-input"
            type="text"
            placeholder="Search tasks, milestones, tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <select
          id="priority-filter-select"
          value={selectedPriority}
          onChange={(e) => onPriorityChange(e.target.value as Priority | 'all')}
          className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium shadow-2xs cursor-pointer"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        {/* Tag Filter */}
        {availableTags.length > 0 && (
          <select
            id="tag-filter-select"
            value={selectedTag}
            onChange={(e) => onTagChange(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium shadow-2xs cursor-pointer"
          >
            <option value="all">All Tags</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
        )}

        {/* Pending Milestones Only Toggle */}
        <button
          id="toggle-pending-milestones-only"
          onClick={() => onPendingOnlyChange(!pendingOnly)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 shadow-2xs ${
            pendingOnly
              ? 'bg-amber-500 text-white border-amber-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>Has Pending Milestones</span>
        </button>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* View Switcher Right Group */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start md:self-auto">
        <button
          id="view-kanban-btn"
          onClick={() => onViewChange('kanban')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
            currentView === 'kanban'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          Kanban Board
        </button>

        <button
          id="view-milestones-matrix-btn"
          onClick={() => onViewChange('milestones_matrix')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
            currentView === 'milestones_matrix'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Milestones Matrix
        </button>
      </div>
    </div>
  );
};
