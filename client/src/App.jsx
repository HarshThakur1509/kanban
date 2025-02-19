import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Nav } from "./components/Nav";
import { Home } from "./components/Home";

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
        <Nav />
        <Home />
      </QueryClientProvider>
    </div>
  );
}

export default App;
