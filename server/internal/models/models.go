package models

import "gorm.io/gorm"

type Column struct {
	gorm.Model
	Name  string `gorm:"not null"`
	Tasks []Task `gorm:"constraint:OnDelete:CASCADE;"`
}

type Task struct {
	gorm.Model
	Title       string `gorm:"not null"`
	Description string
	Status      string `gorm:"default:'To Do'"`
	ColumnID    uint   `gorm:"default:1"`
}
