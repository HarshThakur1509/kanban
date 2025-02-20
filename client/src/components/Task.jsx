import PropTypes from "prop-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const Task = ({ task, onDragStart }) => {
  const API = "http://localhost:3000";
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.Title);
  const [editedDescription, setEditedDescription] = useState(task.Description);

  const deleteTask = useMutation({
    mutationFn: async (taskId) => {
      const response = await fetch(`${API}/task/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete task");
      }
      return taskId;
    },
    onSuccess: (deletedTaskId) => {
      queryClient.setQueryData(["columns"], (oldData) => {
        return oldData.map((column) => ({
          ...column,
          Tasks: (column.Tasks || []).filter((t) => t.ID !== deletedTaskId),
        }));
      });
    },
  });

  const updateTask = useMutation({
    mutationFn: async (updatedTask) => {
      const response = await fetch(`${API}/task/${task.ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });
      if (!response.ok) {
        throw new Error("Failed to update task");
      }
      return response.json();
    },
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(["columns"], (oldData) => {
        return oldData.map((column) => ({
          ...column,
          Tasks: (column.Tasks || []).map((t) =>
            t.ID === updatedTask.ID ? updatedTask : t
          ),
        }));
      });
      setIsEditing(false);
    },
  });

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editedTitle.trim()) return;
    updateTask.mutate({
      Title: editedTitle,
      Description: editedDescription,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTitle(task.Title);
    setEditedDescription(task.Description);
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent drag event from triggering
    if (window.confirm("Are you sure you want to delete this task?")) {
      deleteTask.mutate(task.ID);
    }
  };

  return (
    <div
      className="Task relative group"
      draggable={!isEditing}
      onDragStart={(e) => !isEditing && onDragStart(e, task.ID)}
    >
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full p-1 border rounded"
            required
          />
          <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="w-full p-1 border rounded"
          />
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              disabled={updateTask.isPending}
              className="px-2 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              {updateTask.isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 btn"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex justify-between items-center gap-2">
            <span>{task.Title}</span>
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="text-blue-500 hover:text-blue-600 btn"
                title="Edit task"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteTask.isPending}
                className="text-red-500 hover:text-red-600 btn"
                title="Delete task"
              >
                {deleteTask.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
          {task.Description && (
            <p className="text-sm text-gray-600 mt-1">{task.Description}</p>
          )}
          {task.Status && <p className="task-status">{task.Status}</p>}
        </>
      )}
    </div>
  );
};

Task.propTypes = {
  task: PropTypes.shape({
    ID: PropTypes.number.isRequired,
    Title: PropTypes.string.isRequired,
    Description: PropTypes.string,
    Status: PropTypes.string,
  }).isRequired,
  onDragStart: PropTypes.func.isRequired,
};

Task.displayName = "Task";
