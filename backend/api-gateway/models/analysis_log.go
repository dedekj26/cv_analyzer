package models

import (
	"time"
)

// AnalysisLog represents a row in the AnalysisLogs table.
type AnalysisLog struct {
	LogID            string    `db:"LogID"`
	Timestamp        time.Time `db:"Timestamp"`
	FileSizeKB       int       `db:"FileSizeKB"`
	FileType         string    `db:"FileType"`
	ProcessingTimeMs int       `db:"ProcessingTimeMs"`
	OverallScore     *int      `db:"OverallScore"`
	Status           string    `db:"Status"`
	ErrorMessage     *string   `db:"ErrorMessage"`
}

// ApiUsageLog represents a row in the ApiUsageLogs table.
type ApiUsageLog struct {
	LogID            string    `db:"LogID"`
	AnalysisLogID    string    `db:"AnalysisLogID"`
	Model            string    `db:"Model"`
	PromptTokens     *int      `db:"PromptTokens"`
	CompletionTokens *int      `db:"CompletionTokens"`
	TotalTokens      *int      `db:"TotalTokens"`
	CostUSD          *float64  `db:"CostUSD"`
	CreatedAt        time.Time `db:"CreatedAt"`
}
