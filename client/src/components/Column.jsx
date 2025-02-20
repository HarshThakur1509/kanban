import PropTypes from "prop-types";
import { useState } from "react";
import { Task } from "./Task";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const Column = ({ column, onDrop, tasks }) => {
  const API = "http://localhost:3000";
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ Title: "", Description: "" });

  const createTask = useMutation({
    mutationFn: async (taskData) => {
      const response = await fetch(`${API}/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      if (!response.ok) {
        throw new Error("Failed to create task");
      }
      return response.json();
    },
    onSuccess: (createdTask) => {
      queryClient.setQueryData(["columns"], (oldData) => {
        return oldData.map((col) => {
          if (col.Name === column.Name) {
            return {
              ...col,
              Tasks: [...(col.Tasks || []), createdTask],
            };
          }
          return col;
        });
      });
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.Title.trim()) return;

    createTask.mutate({
      Title: newTask.Title,
      Description: newTask.Description,
      Status: column.Name,
    });

    setNewTask({ Title: "", Description: "" });
    setShowForm(false);
  };

  // In Column.jsx, update the deleteColumn mutation:
  const deleteColumn = useMutation({
    mutationFn: async (columnId) => {
      const response = await fetch(`${API}/column/${columnId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete column");
      }
      return columnId;
    },
    onSuccess: (deletedColumnId) => {
      queryClient.setQueryData(
        ["columns"],
        (oldData) => oldData.filter((col) => col.ID !== deletedColumnId) // Fix this line
      );
    },
  });

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent drag event from triggering
    if (window.confirm("Are you sure you want to delete this column?")) {
      deleteColumn.mutate(column.ID);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    onDrop(taskId, column.Name);
  };

  return (
    <div className="Column" onDragOver={handleDragOver} onDrop={handleDrop}>
      <div className="column-header">
        <h3>{column.Name}</h3>
        <button className="btn" onClick={handleDelete}>
          X
        </button>
      </div>
      {tasks.map((task) => (
        <div className="card" key={task.ID}>
          <Task
            task={task}
            onDragStart={(e, taskId) =>
              e.dataTransfer.setData("taskId", taskId)
            }
          />
        </div>
      ))}
      <div className="form">
        {showForm ? (
          <form onSubmit={handleSubmit} className="task-form">
            <input
              type="text"
              name="Title"
              placeholder="Title"
              value={newTask.Title}
              onChange={handleInputChange}
              required
            />
            <textarea
              name="Description"
              placeholder="Description"
              value={newTask.Description}
              onChange={handleInputChange}
            />
            <button type="submit" disabled={createTask.isPending}>
              {createTask.isPending ? "Adding..." : "Add Task"}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </form>
        ) : (
          <button className="btn" onClick={() => setShowForm(true)}>
            Add Task
          </button>
        )}
      </div>
    </div>
  );
};

Column.propTypes = {
  column: PropTypes.shape({
    ID: PropTypes.number.isRequired,
    Name: PropTypes.string.isRequired,
    Tasks: PropTypes.arrayOf(
      PropTypes.shape({
        ID: PropTypes.number.isRequired,
        Title: PropTypes.string.isRequired,
        Description: PropTypes.string,
      })
    ),
  }).isRequired,
  onDrop: PropTypes.func.isRequired,
  tasks: PropTypes.array.isRequired,
};

Column.displayName = "Column";
