import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const Deleted = () => {
  const API = "http://localhost/api";
  const queryClient = useQueryClient();

  const {
    data: deletedTasks,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["deletedTasks"],
    queryFn: async () => {
      const res = await axios.get(`${API}/deleted/task`);
      return res.data;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const unDeleteTask = useMutation({
    mutationFn: async (taskId) => {
      const response = await fetch(`${API}/undo/task/${taskId}`, {
        method: "PUT",
      });
      if (!response.ok) {
        throw new Error("Failed to undelete task");
      }
      return taskId;
    },
    onSuccess: (deletedTaskId) => {
      queryClient.setQueryData(["columns"], (oldData) => {
        return oldData.map((column) => ({
          ...column,
          Tasks: (column.Tasks || []).filter((t) => t.ID === deletedTaskId),
        }));
      });
    },
  });

  const handleUnDelete = (e, id) => {
    e.stopPropagation(); // Prevent unintended events
    if (window.confirm("Are you sure you want to restore this task?")) {
      unDeleteTask.mutate(id);
    }
  };

  if (isLoading)
    return <p className="loading-text">Loading deleted tasks...</p>;
  if (isError) return <p className="error-text">Error: {error.message}</p>;

  return (
    <div className="Deleted">
      <h2 className="section-title">Deleted Tasks</h2>

      {deletedTasks.length === 0 ? (
        <p className="empty-state">No deleted tasks found.</p>
      ) : (
        <div className="task-list">
          {deletedTasks.map((task) => (
            <div className="card deleted-task" key={task.ID}>
              <h3 className="task-title">{task.Title}</h3>
              {task.Description && (
                <p className="task-desc">{task.Description}</p>
              )}
              {task.Status && <p className="task-status">{task.Status}</p>}

              <button
                onClick={(e) => handleUnDelete(e, task.ID)}
                disabled={unDeleteTask.isPending}
                className="btn"
                title="Restore Task"
              >
                {unDeleteTask.isPending ? "Restoring..." : "Restore"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
