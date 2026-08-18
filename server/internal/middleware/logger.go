package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		startedAt := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		c.Next()

		log.Printf("method=%s path=%s query=%q status=%d latency=%s client_ip=%s",
			c.Request.Method,
			path,
			query,
			c.Writer.Status(),
			time.Since(startedAt),
			c.ClientIP(),
		)
	}
}
