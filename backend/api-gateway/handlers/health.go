package handlers

import "github.com/gofiber/fiber/v2"

// HealthCheck godoc
// @Summary Check API health
// @Description get the status of server
// @Tags health
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/health [get]
func HealthCheck(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status":  "ok",
		"version": "1.0.0",
	})
}
