package wiki

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/alecthomas/assert/v2"
	"github.com/hexops/autogold/v2"
)

func Test_wiki_emptyConfig(t *testing.T) {
	router := Wiki(EmptyConfig{})

	var cases = []struct {
		name, url string
		response  autogold.Value
		status    int
	}{
		{name: "404 Not Found", url: "/definitelynotaurl", status: http.StatusNotFound, response: autogold.Expect("404 Not found")},
		{name: "Reflect with only reflect", url: "/definitelynotaurl?reflect", status: http.StatusOK, response: autogold.Expect("map[reflect:]")},
		{name: "Reflect with other arbitrary queryparams", url: "/definitelynotaurl?reflect&meow&layer=any/specifier", status: http.StatusOK, response: autogold.Expect("map[layer:any/specifier meow: reflect:]")},
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

// Literal means "no templating occurred" either because there is no templating
// functionality, or because the raw file was requested. This means the expected
// value should be the exact file as it is on disk.
func Test_wiki_user1_literal(t *testing.T) {
	router := Wiki(user1NoAuthConfig())

	var cases = []struct {
		name, url string
		status    int
	}{
		{name: "literal shadowed html", url: "/index.html", status: http.StatusOK},
		{name: "literal shadowed html by specifier", url: "/index.html?layer=user1/base", status: http.StatusOK},
		{name: "literal shadowed html with no leading slash", url: "index.html", status: http.StatusOK},
		{name: "literal unshadowed html", url: "unshadowed.html", status: http.StatusOK},
		{name: "literal unshadowed html by specifier is empty", url: "unshadowed.html?layer=user1/second", status: http.StatusNotFound},
	}

	for index, test := range cases {
		t.Run(fmt.Sprintf("%q (case #%d)", test.name, index+1), func(t *testing.T) {
			req, _ := http.NewRequest(http.MethodGet, test.url, nil)
			w := testRequest(t, router, req)

			assert.Equal(t, w.Result().Header.Get("Content-Type"), "text/html; charset=utf-8")
			assert.Equal(t, test.status, w.Code)
			autogold.ExpectFile(t, w.Body.String())
		})
	}
}

func Test_wiki_simple_templating(t *testing.T) {
	router := Wiki(user1NoAuthConfig())

	var cases = []struct {
		name, url string
		status    int
	}{
		{name: "<r- content> test", url: "/templated.html", status: http.StatusOK},
		{name: "parameterized test", url: "/parameterized.html?foo=42&bar=9", status: http.StatusOK},
	}

	// TODO: Pull this into a method.
	for index, test := range cases {
		t.Run(fmt.Sprintf("%q (case #%d)", test.name, index+1), func(t *testing.T) {
			req, _ := http.NewRequest(http.MethodGet, test.url, nil)
			w := testRequest(t, router, req)

			assert.Equal(t, w.Result().Header.Get("Content-Type"), "text/html; charset=utf-8")
			assert.Equal(t, test.status, w.Code)
			autogold.ExpectFile(t, w.Body.String())
		})
	}
}
