import { useEffect, useState } from "react";
import axios from "axios";

export const Nav = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [showForm, setShowForm] = useState(false);
  const [newColumn, setNewColumn] = useState("");
  const API = "http://localhost:3000";

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };
  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setNewColumn((prev) => ({ ...prev, [name]: value }));
  //   console.log(newColumn);
  // };
  const createColumn = async () => {
    try {
      const response = await axios.post(`${API}/column`, {
        name: newColumn,
      });
      console.log("Column created:", response.data);
    } catch (error) {
      console.error("Error creating column:", error);
    }
  };

  return (
    <div className="Nav">
      {showForm ? (
        <form onSubmit={createColumn} className="column-form">
          <input
            type="text"
            name="Name"
            placeholder="Name"
            value={newColumn.Name}
            onChange={(e) => {
              setNewColumn(e.target.value);
              console.log(newColumn);
            }}
            required
          />

          <button type="submit">{showForm ? "Add Column" : "..."}</button>
          <button
            type="button"
            className="btn"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </button>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)} className="btn">
          Add Column
        </button>
      )}
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </button>
    </div>
  );
};
