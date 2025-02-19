package routes

import (
	"fmt"
	"kanban/internal/handlers"
	"kanban/internal/middleware"
	"net/http"

	"github.com/rs/cors"
)

type ApiServer struct {
	addr string
}

func NewApiServer(addr string) *ApiServer {
	return &ApiServer{addr: addr}
}

func (s *ApiServer) Run() error {
	router := http.NewServeMux()

	router.HandleFunc("POST /column", handlers.PostColumn)
	router.HandleFunc("POST /task", handlers.PostTask)
	router.HandleFunc("GET /column", handlers.ListColumn)
	router.HandleFunc("PUT /task/{id}", handlers.ChangeStatus)
	router.HandleFunc("DELETE /column/{id}", handlers.DeleteColumn)
	router.HandleFunc("DELETE /task/{id}", handlers.DeleteTask)
	router.HandleFunc("PUT /undo/column/{id}", handlers.UndoDeleteColumn)
	router.HandleFunc("PUT /undo/task/{id}", handlers.UndoDeleteTask)

	// Add code here

	stack := middleware.MiddlewareChain(middleware.Logger, middleware.RecoveryMiddleware)

	corsHandler := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173"}, // Specify your React frontend origin
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders: []string{"Content-Type"},
	}).Handler(stack(router))

	server := http.Server{
		Addr:    s.addr,
		Handler: corsHandler,
	}
	fmt.Println("Server has started", s.addr)
	return server.ListenAndServe()
}
