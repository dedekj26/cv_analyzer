package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
)

type AnalyzeResponse struct {
	Status string      `json:"status"`
	Data   interface{} `json:"data"`
}

// AnalyzeCV godoc
// @Summary Analyze CV document
// @Description Upload a PDF or DOCX file to analyze using AI
// @Tags analyze
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "CV File (PDF/DOCX) max 5MB"
// @Success 200 {object} AnalyzeResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 413 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/analyze [post]
func AnalyzeCV(c *fiber.Ctx) error {
	startTime := time.Now()

	fileHeader, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to read file from request",
		})
	}

	if fileHeader.Size > 5*1024*1024 {
		return c.Status(fiber.StatusRequestEntityTooLarge).JSON(fiber.Map{
			"error": "File exceeds 5MB limit",
		})
	}
	
	pythonServiceURL := os.Getenv("PYTHON_SERVICE_URL")
	if pythonServiceURL == "" {
		pythonServiceURL = "http://localhost:8000"
	}

	file, err := fileHeader.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not open uploaded file",
		})
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", fileHeader.Filename)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not forward file",
		})
	}
	_, err = io.Copy(part, file)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not read file data",
		})
	}
	writer.Close()

	req, err := http.NewRequest("POST", fmt.Sprintf("%s/analyze", pythonServiceURL), body)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Could not create request to AI service",
		})
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return c.Status(fiber.StatusGatewayTimeout).JSON(fiber.Map{
			"error": "AI service timeout or unavailable",
		})
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to read AI service response",
		})
	}

	var aiResponse AnalyzeResponse
	if err := json.Unmarshal(respBody, &aiResponse); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Invalid response format from AI service",
		})
	}

	processingTime := time.Since(startTime).Milliseconds()

	return c.JSON(fiber.Map{
		"status":             aiResponse.Status,
		"data":               aiResponse.Data,
		"processing_time_ms": processingTime,
	})
}
