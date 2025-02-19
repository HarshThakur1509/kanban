package handlers

import (
	"encoding/json"
	"kanban/internal/initializers"
	"kanban/internal/models"
	"net/http"

	"gorm.io/gorm"
)

func PostColumn(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Name string
	}
	json.NewDecoder(r.Body).Decode(&body)

	column := models.Column{Name: body.Name}
	result := initializers.DB.Create(&column)

	if result.Error != nil {
		http.Error(w, "Something went wrong!!", http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated) // 201 Created
	json.NewEncoder(w).Encode(column)
}

func PostTask(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Title       string
		Description string
		Status      string
	}
	json.NewDecoder(r.Body).Decode(&body)

	task := models.Task{Title: body.Title, Description: body.Description, Status: body.Status}

	var column models.Column
	initializers.DB.First(&column, "name = ?", body.Status)

	task.ColumnID = column.ID
	result := initializers.DB.Create(&task)

	if result.Error != nil {
		http.Error(w, "Something went wrong!!", http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated) // 201 Created
	json.NewEncoder(w).Encode(task)
}

func ListColumn(w http.ResponseWriter, r *http.Request) {
	var column []models.Column
	initializers.DB.Preload("Tasks").Find(&column)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(column)
}

func ChangeStatus(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	var body struct {
		Title       string
		Description string
		Status      string
	}
	json.NewDecoder(r.Body).Decode(&body)

	var task models.Task
	initializers.DB.First(&task, id)

	var column models.Column
	if body.Status != "" {
		initializers.DB.First(&column, "name = ?", body.Status)
		task.Status = body.Status
		task.ColumnID = column.ID
	}
	if body.Title != "" {
		task.Title = body.Title
	}
	if body.Description != "" {
		task.Description = body.Description
	}

	result := initializers.DB.Save(&task)

	if result.Error != nil {
		http.Error(w, "Something went wrong!!", http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(task)
}

func DeleteTask(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var task models.Task
	initializers.DB.Delete(&task, id)
	w.WriteHeader(http.StatusNoContent) // 204 No Content
}
func DeleteColumn(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var column models.Column
	initializers.DB.Delete(&column, id)
	w.WriteHeader(http.StatusNoContent) // 204 No Content
}

func UndoDeleteTask(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var task models.Task
	initializers.DB.Unscoped().First(&task, id)
	// if err != nil {
	// 	http.Error(w, "Something went wrong!!", http.StatusBadRequest)
	// 	return
	// }

	task.DeletedAt = gorm.DeletedAt{}

	result := initializers.DB.Unscoped().Save(&task)
	if result.Error != nil {
		http.Error(w, "Failed to update deleted task", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(task)
}
func UndoDeleteColumn(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var column models.Column
	err := initializers.DB.Unscoped().First(&column, id)
	if err != nil {
		http.Error(w, "Something went wrong!!", http.StatusBadRequest)
		return
	}

	column.DeletedAt = gorm.DeletedAt{}

	result := initializers.DB.Unscoped().Save(&column)
	if result.Error != nil {
		http.Error(w, "Failed to update deleted column", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(column)
}
