// App.jsx
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import api from './api';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import './App.css';

function App() {
  const [tasks, setTasks] = useState({
    'to-do': {},
    'in-progress': {},
    'done': {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [targetColumn, setTargetColumn] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const columns = [
    { id: 'to-do', title: 'To Do', color: 'bg-red-100 border-red-300' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-yellow-100 border-yellow-300' },
    { id: 'done', title: 'Done', color: 'bg-green-100 border-green-300' }
  ];

  // Load initial tasks
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all tasks at once
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
      // Set empty structure on error
      setTasks({
        'to-do': {},
        'in-progress': {},
        'done': {}
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle drag end
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Optimistically update the UI
    setTasks(prevTasks => {
      const newTasks = { ...prevTasks };
      
      // Find the task being moved
      let movedTask = null;
      for (const [columnId, columnTasks] of Object.entries(newTasks)) {
        if (columnTasks[draggableId]) {
          movedTask = columnTasks[draggableId];
          break;
        }
      }

      if (!movedTask) return prevTasks;

      // Remove task from source column
      const sourceColumn = { ...newTasks[source.droppableId] };
      delete sourceColumn[draggableId];
      newTasks[source.droppableId] = sourceColumn;

      // Add task to destination column
      const destColumn = { ...newTasks[destination.droppableId] };
      destColumn[draggableId] = movedTask;
      newTasks[destination.droppableId] = destColumn;

      return newTasks;
    });

    // Update backend
    try {
      await api.post('/tasks/move', {
        source_column: source.droppableId,
        destination_column: destination.droppableId,
        task_id: draggableId
      });
    } catch (err) {
      console.error('Error moving task:', err);
      // Revert the optimistic update on error
      loadTasks();
      setError('Failed to move task. Please try again.');
    }
  };

  // Handle task creation/editing
  const handleSaveTask = async (taskData) => {
    try {
      setActionLoading(true);
      
      if (editingTask) {
        // Edit existing task
        const response = await api.put(`/tasks/${editingTask.id}`, taskData);
        
        // Update local state
        setTasks(prevTasks => {
          const newTasks = { ...prevTasks };
          const columnId = findTaskColumn(editingTask.id);
          
          if (columnId) {
            newTasks[columnId] = {
              ...newTasks[columnId],
              [editingTask.id]: response.data
            };
          }
          
          return newTasks;
        });
      } else {
        // Create new task
        const response = await api.post(`/tasks/${targetColumn}`, taskData);
        const newTask = response.data;
        
        setTasks(prevTasks => ({
          ...prevTasks,
          [targetColumn]: {
            ...prevTasks[targetColumn],
            [newTask.id]: newTask
          }
        }));
      }
      
      setIsModalOpen(false);
      setEditingTask(null);
      setTargetColumn(null);
    } catch (err) {
      console.error('Error saving task:', err);
      setError(editingTask ? 'Failed to update task' : 'Failed to create task');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    try {
      setActionLoading(true);
      
      await api.delete(`/tasks/${taskId}`);
      
      // Update local state
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        const columnId = findTaskColumn(taskId);
        
        if (columnId) {
          const columnCopy = { ...newTasks[columnId] };
          delete columnCopy[taskId];
          newTasks[columnId] = columnCopy;
        }
        
        return newTasks;
      });
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    } finally {
      setActionLoading(false);
    }
  };

  // Find which column contains a task
  const findTaskColumn = (taskId) => {
    for (const [columnId, columnTasks] of Object.entries(tasks)) {
      if (columnTasks[taskId]) {
        return columnId;
      }
    }
    return null;
  };

  // Open modal for new task
  const openNewTaskModal = (columnId) => {
    setTargetColumn(columnId);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Open modal for editing task
  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setTargetColumn(null);
    setIsModalOpen(true);
  };

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 text-center">Task Board</h1>
          <p className="text-gray-600 text-center mt-2">Organize your tasks by dragging them between columns</p>
          
          {/* Error notification */}
          {error && (
            <div className="max-w-md mx-auto mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((column) => (
              <div key={column.id} className={`${column.color} rounded-lg border-2 p-4`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-700">
                    {column.title}
                    <span className="ml-2 text-sm text-gray-500">
                      ({Object.keys(tasks[column.id] || {}).length})
                    </span>
                  </h2>
                  <button
                    onClick={() => openNewTaskModal(column.id)}
                    disabled={actionLoading}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                  >
                    + Add Task
                  </button>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-64 space-y-3 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-gray-100 rounded-lg p-2' : ''
                      }`}
                    >
                      {Object.entries(tasks[column.id] || {}).map(([taskId, task], index) => (
                        <Draggable key={taskId} draggableId={taskId} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={snapshot.isDragging ? 'opacity-80 rotate-2' : ''}
                            >
                              <TaskCard
                                task={task}
                                onEdit={() => openEditTaskModal(task)}
                                onDelete={() => handleDeleteTask(task.id)}
                                disabled={actionLoading}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {Object.keys(tasks[column.id] || {}).length === 0 && (
                        <div className="text-gray-400 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                          No tasks yet. Click "Add Task" to get started!
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>

        {isModalOpen && (
          <TaskModal
            task={editingTask}
            onSave={handleSaveTask}
            onClose={() => {
              setIsModalOpen(false);
              setEditingTask(null);
              setTargetColumn(null);
            }}
            loading={actionLoading}
          />
        )}

        {/* Loading overlay */}
        {actionLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-700">Processing...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;