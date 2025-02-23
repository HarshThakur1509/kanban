import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export const Nav = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [showForm, setShowForm] = useState(false);
  const [newColumn, setNewColumn] = useState("");
  const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu
  const API = "http://localhost/api";

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const createColumn = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/column`, { name: newColumn });
      console.log("Column created:", response.data);
      setShowForm(false);
      setNewColumn("");
    } catch (error) {
      console.error("Error creating column:", error);
    }
  };

  return (
    <nav className="Nav">
      <button className="menu-toggle" onClick={toggleMenu}>
        <span>☰</span>
      </button>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <Link className="btn" to="/" onClick={() => setMenuOpen(false)}>
          Home
        </Link>
        <Link className="btn" to="/deleted" onClick={() => setMenuOpen(false)}>
          Deleted tasks
        </Link>
        <div className="form">
          {showForm ? (
            <form onSubmit={createColumn} className="column-form">
              <input
                type="text"
                placeholder="Column Name"
                value={newColumn}
                onChange={(e) => setNewColumn(e.target.value)}
                required
              />
              <button type="submit">Add</button>
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
        </div>
      </div>

      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === "light" ? "🌙" : "☀️"}
      </button>
    </nav>
  );
};
