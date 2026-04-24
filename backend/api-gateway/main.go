// @title CV Analyzer API
// @version 1.0
// @description API Gateway for CV Analyzer
// @host localhost:3000
// @BasePath /

package main

import (
	"log"
	"os"

	"cv_analyzer_api/database"
	_ "cv_analyzer_api/docs"
	"cv_analyzer_api/handlers"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/swagger"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	// Database: connect + auto-migrate schema
	database.Connect()
	database.Migrate()

	app := fiber.New(fiber.Config{
		BodyLimit: 5 * 1024 * 1024, // 5MB limit
	})

	app.Use(logger.New())
	app.Use(cors.New())
	app.Use(limiter.New(limiter.Config{
		Max: 20,
	}))

	v1 := app.Group("/api/v1")

	app.Get("/swagger/*", swagger.HandlerDefault)

	v1.Get("/health", handlers.HealthCheck)
	v1.Post("/analyze", handlers.AnalyzeCV)
	v1.Post("/report/generate", handlers.GenerateReport)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("Starting API Gateway on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
