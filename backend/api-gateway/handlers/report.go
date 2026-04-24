package handlers

import (
	"bytes"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/jung-kurt/gofpdf"
)

type ReportData struct {
	Score           int      `json:"score"`
	Label           string   `json:"label"`
	Strengths       []string `json:"strengths"`
	Weaknesses      []string `json:"weaknesses"`
	Recommendations []string `json:"recommendations"`
}

// GenerateReport godoc
// @Summary Generate CV analysis report
// @Description Generate a PDF report from analysis JSON data
// @Tags report
// @Accept json
// @Produce application/pdf
// @Param data body ReportData true "Report Data"
// @Success 200 {file} file
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /api/v1/report/generate [post]
func GenerateReport(c *fiber.Ctx) error {
	var data ReportData
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()
	
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "CV Analysis Report")
	pdf.Ln(12)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(40, 10, fmt.Sprintf("Score: %d", data.Score))
	pdf.Ln(8)
	pdf.Cell(40, 10, fmt.Sprintf("Label: %s", data.Label))
	pdf.Ln(12)

	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(40, 10, "Strengths:")
	pdf.Ln(8)
	pdf.SetFont("Arial", "", 12)
	for _, s := range data.Strengths {
		pdf.MultiCell(0, 8, fmt.Sprintf("- %s", s), "", "L", false)
	}
	pdf.Ln(4)

	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(40, 10, "Weaknesses:")
	pdf.Ln(8)
	pdf.SetFont("Arial", "", 12)
	for _, w := range data.Weaknesses {
		pdf.MultiCell(0, 8, fmt.Sprintf("- %s", w), "", "L", false)
	}
	pdf.Ln(4)

	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(40, 10, "Recommendations:")
	pdf.Ln(8)
	pdf.SetFont("Arial", "", 12)
	for _, r := range data.Recommendations {
		pdf.MultiCell(0, 8, fmt.Sprintf("- %s", r), "", "L", false)
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate PDF",
		})
	}

	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", "attachment; filename=cv_report.pdf")
	return c.Send(buf.Bytes())
}
