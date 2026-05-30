package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path"
	"testing"

	"github.com/hexops/autogold/v2"
	"github.com/stretchr/testify/assert"
)

const (
	fixtureFSRoot string = "test/fixtures/layers"
)

// Only one router setup and requested over and over again so it won't work
// if there's any state
func Test_statelessRouter_staticRequests(t *testing.T) {
	router := NewHandler()

	var cases = []struct {
		name, url, response string
		status              int
	}{
		{name: "404 Not Found", url: "/definitelynotaurl", status: http.StatusNotFound, response: "404 Not found"},
		{name: "Reflect with only reflect", url: "/definitelynotaurl?reflect", status: http.StatusOK, response: "map[reflect:[]]"},
		{name: "Reflect with other arbitrary queryparams", url: "/definitelynotaurl?reflect&meow", status: http.StatusOK, response: "map[meow:[] reflect:[]]"},
	}

	for index, test := range cases {
		t.Run(fmt.Sprintf("%q (case #%d)", test.name, index+1), func(t *testing.T) {
			req, _ := http.NewRequest(http.MethodGet, test.url, nil)
			w := testRequest(t, router, req)

			assert.Equal(t, test.status, w.Code)
			assert.Equal(t, test.response, w.Body.String())

		})
	}
}

func Test_statelessRouter_staticRequests_files(t *testing.T) {
	router := NewHandler()

	user1BaseIndexHtml, err := os.ReadFile(path.Join(fixtureFSRoot, "user1/base/index.html"))
	if err != nil {
		t.Fatal(err)
	}

	var cases = []struct {
		name, url string
		expected  []byte
		status    int
	}{
		{name: "literal html file (no templating)", url: "/user1/base/index.html", status: http.StatusOK, expected: user1BaseIndexHtml},
		{name: "literal html file (no templating, no leading slash)", url: "user1/base/index.html", status: http.StatusOK, expected: user1BaseIndexHtml},
	}

	for index, test := range cases {
		t.Run(fmt.Sprintf("%q (case #%d)", test.name, index+1), func(t *testing.T) {
			req, _ := http.NewRequest(http.MethodGet, test.url, nil)
			w := testRequest(t, router, req)

			assert.Equal(t, test.status, w.Code)
			assert.Equal(t, string(test.expected), w.Body.String())
		})
	}
}

func Test_statelessRouter_staticRequests_autogold(t *testing.T) {
	router := NewHandler()

	var cases = []struct {
		name, url string
		response  autogold.Value
		status    int
	}{
		{name: "404 Not Found", url: "/definitelynotaurl", status: http.StatusNotFound, response: autogold.Expect("404 Not found")},
		{name: "Reflect with only reflect", url: "/definitelynotaurl?reflect", status: http.StatusOK, response: autogold.Expect("map[reflect:[]]")},
		{name: "Reflect with other arbitrary queryparams", url: "/definitelynotaurl?reflect&meow", status: http.StatusOK, response: autogold.Expect("map[meow:[] reflect:[]]")},
	}

	for index, test := range cases {
		t.Run(fmt.Sprintf("%q (case #%d)", test.name, index+1), func(t *testing.T) {
			req, _ := http.NewRequest(http.MethodGet, test.url, nil)
			w := testRequest(t, router, req)

			assert.Equal(t, test.status, w.Code)
			test.response.Equal(t, w.Body.String())
		})
	}
}

func Test_statelessRouter_staticRequests_autogoldFiles(t *testing.T) {
	router := NewHandler()
	var cases = []struct {
		name, url string
		status    int
	}{
		{name: "literal html file (no templating)", url: "/user1/base/index.html", status: http.StatusOK},
		{name: "literal html file (no templating, no leading slash)", url: "user1/base/index.html", status: http.StatusOK},
	}

	for index, test := range cases {
		t.Run(fmt.Sprintf("%q (case #%d)", test.name, index+1), func(t *testing.T) {
			req, _ := http.NewRequest(http.MethodGet, test.url, nil)
			w := testRequest(t, router, req)

			assert.Equal(t, test.status, w.Code)
			autogold.ExpectFile(t, w.Body.String())
		})
	}
}
func testRequest(t testing.TB, router http.Handler, req *http.Request) *httptest.ResponseRecorder {
	t.Helper()
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	return w
}
