package database

import (
	"fmt"
	"log"
	"os"
	"strings"

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

	// Pisahkan host dan named instance (e.g. "localhost\SQLEXPRESS")
	actualHost := host
	instance := ""
	if parts := strings.SplitN(host, `\`, 2); len(parts) == 2 {
		actualHost = parts[0]
		instance = parts[1]
	}

	var dsn string
	if user == "" {
		// Windows Authentication
		if instance != "" {
			dsn = fmt.Sprintf(
				"sqlserver://%s?instance=%s&database=%s&connection+timeout=30",
				actualHost, instance, dbName,
			)
		} else {
			dsn = fmt.Sprintf(
				"sqlserver://%s:%s?database=%s&connection+timeout=30",
				actualHost, port, dbName,
			)
		}
	} else {
		// SQL Authentication
		if instance != "" {
			dsn = fmt.Sprintf(
				"sqlserver://%s:%s@%s?instance=%s&database=%s&connection+timeout=30",
				user, password, actualHost, instance, dbName,
			)
		} else {
			dsn = fmt.Sprintf(
				"sqlserver://%s:%s@%s:%s?database=%s&connection+timeout=30",
				user, password, actualHost, port, dbName,
			)
		}
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
