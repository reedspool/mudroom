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

	user1BaseIndexHtml := mustReadFile(t, "user1/base/index.html")
	user1BaseUnshadowedHtml := mustReadFile(t, "user1/base/unshadowed.html")
	user1SecondIndexHtml := mustReadFile(t, "user1/second/index.html")

	var cases = []struct {
		name, url string
		expected  string
		status    int
	}{
		{name: "literal shadowed html", url: "/index.html", status: http.StatusOK, expected: user1SecondIndexHtml},
		{name: "literal shadowed html by specifier", url: "/index.html?layer=user1/base", status: http.StatusOK, expected: user1BaseIndexHtml},
		{name: "literal shadowed html with no leading slash", url: "index.html", status: http.StatusOK, expected: user1SecondIndexHtml},
		{name: "literal unshadowed html", url: "unshadowed.html", status: http.StatusOK, expected: user1BaseUnshadowedHtml},
		{name: "literal unshadowed html by specifier is empty", url: "unshadowed.html?layer=user1/second", status: http.StatusNotFound, expected: "404 Not found"},
	}

	for index, test := range cases {
		t.Run(fmt.Sprintf("%q (case #%d)", test.name, index+1), func(t *testing.T) {
			req, _ := http.NewRequest(http.MethodGet, test.url, nil)
			w := testRequest(t, router, req)

			assert.Equal(t, test.status, w.Code)
			assert.Equal(t, test.expected, w.Body.String())
			// In the case of literal files, this is redundant with the above, but
			// when we add templating this will be more useful as no original file exists.
			autogold.ExpectFile(t, w.Body.String())
		})
	}
}
