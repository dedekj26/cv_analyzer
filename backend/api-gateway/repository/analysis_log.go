package repository

import (
	"cv_analyzer_api/database"
	"cv_analyzer_api/models"

	"github.com/google/uuid"
)

// CreateAnalysisLog inserts a new AnalysisLog row and returns the generated LogID.
func CreateAnalysisLog(log *models.AnalysisLog) (string, error) {
	log.LogID = uuid.New().String()

	query := `
		INSERT INTO AnalysisLogs (LogID, FileSizeKB, FileType, ProcessingTimeMs, OverallScore, Status, ErrorMessage)
		VALUES (:LogID, :FileSizeKB, :FileType, :ProcessingTimeMs, :OverallScore, :Status, :ErrorMessage)
	`

	_, err := database.DB.NamedExec(query, log)
	if err != nil {
		return "", err
	}
	return log.LogID, nil
}

// CreateApiUsageLog inserts a new ApiUsageLog row linked to an AnalysisLog.
func CreateApiUsageLog(usageLog *models.ApiUsageLog) error {
	usageLog.LogID = uuid.New().String()

	query := `
		INSERT INTO ApiUsageLogs (LogID, AnalysisLogID, Model, PromptTokens, CompletionTokens, TotalTokens, CostUSD)
		VALUES (:LogID, :AnalysisLogID, :Model, :PromptTokens, :CompletionTokens, :TotalTokens, :CostUSD)
	`

	_, err := database.DB.NamedExec(query, usageLog)
	return err
}
