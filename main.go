package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func setupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(func(c *gin.Context) {
		if _, ok := c.GetQuery("reflect"); ok {
			c.String(http.StatusOK, fmt.Sprintf("%+v", c.Request.URL.Query()))
			c.Abort()
		}
	})
	r.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	r.NoRoute(func(c *gin.Context) {
		c.String(http.StatusNotFound, "404 Not found")
	})
	return r
}

func main() {
	r := setupRouter()
	r.Run(":8080")
}
