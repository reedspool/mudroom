package main

import (
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/reedspool/html-wiki-two/wiki-server/adapters"
	"github.com/reedspool/html-wiki-two/wiki-server/specs"
)

func TestGetterServer(t *testing.T) {
	// TODO: not using passed port in given func yet
	mapped8080 := adapters.StartDockerServer(t, "8080", "./cmd/httpserver/Dockerfile")
	client := http.Client{
		Timeout: 1 * time.Second,
	}
	driver := Driver{BaseURL: fmt.Sprintf("http://localhost:%d", mapped8080), Client: &client}
	specs.GetLiteralPagesSpecification(t, driver)
}
