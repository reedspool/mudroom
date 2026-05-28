package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/hexops/autogold/v2"
	"github.com/stretchr/testify/assert"
)

// Only one router setup and requested over and over again so it won't work
// if there's any state
func Test_statelessRouter_staticRequests(t *testing.T) {
	router := newHandler()

	var cases = []struct {
		name, url, response string
		status              int
	}{
		{name: "ping (deprecated)", url: "/ping", status: http.StatusOK, response: "pong"},
		{name: "404 Not Found", url: "/definitelynotaurl", status: http.StatusNotFound, response: "404 Not found"},
		// TODO: This format isn't correct. Want this response to depend on content negotation
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

func Test_statelessRouter_staticRequests_autogold(t *testing.T) {
	router := newHandler()

	var cases = []struct {
		name, url string
		response  autogold.Value
		status    int
	}{
		{name: "ping (deprecated)", url: "/ping", status: http.StatusOK, response: autogold.Expect("pong")},
		{name: "404 Not Found", url: "/definitelynotaurl", status: http.StatusNotFound, response: autogold.Expect("404 Not found")},
		// TODO: This format isn't correct. Want this response to depend on content negotation
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

	t.Run("test file", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/testfile", nil)
		w := testRequest(t, router, req)

		assert.Equal(t, http.StatusOK, w.Code)
		autogold.ExpectFile(t, w.Body.String())
	})
}
func testRequest(t testing.TB, router http.Handler, req *http.Request) *httptest.ResponseRecorder {
	t.Helper()
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	return w
}
