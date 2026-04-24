package database

import (
	"fmt"
	"log"
	"os"

	"github.com/jmoiron/sqlx"

	_ "github.com/denisenkom/go-mssqldb"
)

var DB *sqlx.DB

// Connect initializes the SQL Server connection using env variables.
func Connect() {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_DATABASE")
	user := os.Getenv("DB_USERNAME")
	password := os.Getenv("DB_PASSWORD")

	if port == "" {
		port = "1433"
	}

	var dsn string
	if user == "" || user == os.Getenv("DB_HOST") {
		// Windows Authentication
		dsn = fmt.Sprintf(
			"sqlserver://%s?database=%s&connection+timeout=30",
			host, dbName,
		)
	} else {
		dsn = fmt.Sprintf(
			"sqlserver://%s:%s@%s:%s?database=%s&connection+timeout=30",
			user, password, host, port, dbName,
		)
	}

	db, err := sqlx.Connect("sqlserver", dsn)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)

	DB = db
	log.Println("Database connected successfully")
}
