import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Column } from "./Column";

export const Home = () => {
  const API = "http://localhost:3000";
  const queryClient = useQueryClient();

  const {
    data: columns,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["columns"],
    queryFn: async () => {
      const res = await axios.get(`${API}/column`);
      return res.data;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, newStatus }) => {
      const response = await axios.put(`${API}/task/${taskId}`, {
        Status: newStatus,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Optimistic update
      queryClient.setQueryData(["columns"], (oldData) => {
        return oldData
          .map((column) => ({
            ...column,
            Tasks: column.Tasks.filter(
              (task) => task.ID !== parseInt(variables.taskId)
            ),
          }))
          .map((column) => {
            if (column.Name === variables.newStatus) {
              return {
                ...column,
                Tasks: [...column.Tasks, data],
              };
            }
            return column;
          });
      });
    },
  });

  const handleDrop = (taskId, newStatus) => {
    updateTaskStatus.mutate({ taskId, newStatus });
  };

  if (isLoading) return <p>Loading data...</p>;
  if (isError) return <p>Error loading data: {error.message}</p>;

  return (
    <div className="Home">
      {columns.map((column) => (
        <div className="card" key={column.ID}>
          <Column
            column={column}
            onDrop={handleDrop}
            tasks={column.Tasks || []}
          />
        </div>
      ))}
    </div>
  );
};
