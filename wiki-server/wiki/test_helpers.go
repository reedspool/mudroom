package wiki

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path"
	"testing"
)

const (
	fixtureFSRoot string = "testdata/fixtures/layers"
)

func mustReadFile(t testing.TB, filename string) string {
	t.Helper()
	bytes, err := os.ReadFile(path.Join(fixtureFSRoot, filename))
	if err != nil {
		t.Fatalf("File %s not found at (%s)", filename, path.Join(fixtureFSRoot, filename))
	}
	return string(bytes)
}

func user1NoAuthConfig() Config {
	user := "user1"
	baseLayer := Layer{
		User:               user,
		Name:               "base",
		ActualFilePathRoot: path.Join(fixtureFSRoot, user, "base"),
	}
	secondLayer := Layer{
		User:               user,
		Name:               "second",
		ActualFilePathRoot: path.Join(fixtureFSRoot, user, "second"),
	}
	return NoAuthConfig{user, []Layer{baseLayer, secondLayer}}
}

func testRequest(t testing.TB, handler http.Handler, req *http.Request) *httptest.ResponseRecorder {
	t.Helper()
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)
	return w
}
