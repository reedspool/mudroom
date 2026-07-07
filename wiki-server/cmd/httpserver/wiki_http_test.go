package main

import (
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/reedspool/html-wiki-two/wiki-server/adapters"
	"github.com/reedspool/html-wiki-two/wiki-server/specs"
)

// Disabled test (by lowercasing "Test") because I haven't optimized docker (takes ~1min)
func testGetterServer(t *testing.T) {
	mappedPortNum := adapters.StartDockerServer(t, "6767", "./cmd/httpserver/Dockerfile")
	client := http.Client{
		Timeout: 1 * time.Second,
	}
	driver := Driver{BaseURL: fmt.Sprintf("http://localhost:%d", mappedPortNum), Client: &client}
	specs.GetLiteralPagesSpecification(t, driver)
}
