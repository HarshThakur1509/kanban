import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Nav } from "./components/Nav";
import { Home } from "./components/Home";
import { Deleted } from "./components/Deleted";

const client = new QueryClient({
  // defaultOptions: {
  //   queries: {
  //     refetchOnWindowFocus: true,
  //     staleTime: 1000 * 60 * 5, // 5 minutes
  //   },
  // },
});
function App() {
  return (
    <div className="App">
      <QueryClientProvider client={client}>
        <Router>
          <Nav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/deleted" element={<Deleted />} />
            <Route exact path="*" element={<h1>PAGE NOT FOUND!!</h1>} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </div>
  );
}

export default App;
