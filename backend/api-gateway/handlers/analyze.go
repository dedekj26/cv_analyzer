package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"strings"
	"time"

	"cv_analyzer_api/database"
	"cv_analyzer_api/models"
	"cv_analyzer_api/repository"

	"github.com/gofiber/fiber/v2"
)

// AnalyzeResponse format expected by frontend
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

	// Determine file type
	fileType := "UNKNOWN"
	fname := strings.ToLower(fileHeader.Filename)
	if strings.HasSuffix(fname, ".pdf") {
		fileType = "PDF"
	} else if strings.HasSuffix(fname, ".docx") {
		fileType = "DOCX"
	}

	pythonServiceURL := os.Getenv("PYTHON_SERVICE_URL")
	if pythonServiceURL == "" {
		pythonServiceURL = "http://localhost:8001"
	}

	file, err := fileHeader.Open()
	if err != nil {
		logAnalysis(fileHeader.Size, fileType, 0, nil, "FAILED_PARSING", "Could not open file")
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
		processingTime := int(time.Since(startTime).Milliseconds())
		logAnalysis(fileHeader.Size, fileType, processingTime, nil, "TIMEOUT", err.Error())
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

	var aiResponse map[string]interface{}
	if err := json.Unmarshal(respBody, &aiResponse); err != nil {
		processingTime := int(time.Since(startTime).Milliseconds())
		logAnalysis(fileHeader.Size, fileType, processingTime, nil, "FAILED_AI", "Invalid AI response")
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Invalid response format from AI service",
		})
	}

	processingTime := int(time.Since(startTime).Milliseconds())

	// Extract score from data map for logging
	var score *int
	if s, ok := aiResponse["score"].(float64); ok {
		sv := int(s)
		score = &sv
	}

	// Log telemetry asynchronously — does not block the response
	go logAnalysis(fileHeader.Size, fileType, processingTime, score, "SUCCESS", "")

	return c.JSON(fiber.Map{
		"status":             "success",
		"data":               aiResponse,
		"processing_time_ms": processingTime,
	})
}

// logAnalysis writes a telemetry row to AnalysisLogs. Errors are only printed to stdout.
func logAnalysis(fileSize int64, fileType string, processingTimeMs int, score *int, status string, errMsg string) {
	if database.DB == nil {
		return
	}

	var errMsgPtr *string
	if errMsg != "" {
		errMsgPtr = &errMsg
	}

	entry := &models.AnalysisLog{
		FileSizeKB:       int(fileSize / 1024),
		FileType:         fileType,
		ProcessingTimeMs: processingTimeMs,
		OverallScore:     score,
		Status:           status,
		ErrorMessage:     errMsgPtr,
	}

	if _, err := repository.CreateAnalysisLog(entry); err != nil {
		fmt.Printf("Warning: failed to write analysis log: %v\n", err)
	}
}
