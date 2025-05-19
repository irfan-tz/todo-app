import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, disabled = false }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-all duration-200 ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-move'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium text-gray-800 flex-1 pr-2">{task.title}</h3>
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            disabled={disabled}
            className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors disabled:hover:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
            title="Edit task"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this task?')) {
                onDelete();
              }
            }}
            disabled={disabled}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:hover:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
     
      {task.description && (
        <p className="text-sm text-gray-600 line-clamp-3 mb-3">{task.description}</p>
      )}

      {/* Task metadata */}
      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>Created: {formatDate(task.created_at)}</span>
        {task.updated_at && task.updated_at !== task.created_at && (
          <span>Updated: {formatDate(task.updated_at)}</span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;