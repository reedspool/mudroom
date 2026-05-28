package main

import (
	"embed"
	"fmt"
	"net/http"
)

//go:embed test/fixtures
var fixturesFS embed.FS

func setupRouter() *http.Server {
	srv := http.Server{
		Handler: newHandler(),
		Addr:    ":8080",
	}
	return &srv
}

func newHandler() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /", func(w http.ResponseWriter, r *http.Request) {
		hasReflect := r.URL.Query().Has("reflect")

		if hasReflect && r.Method == "GET" {
			w.WriteHeader(200)
			w.Write(fmt.Appendf([]byte{}, "%+v", r.URL.Query()))
		} else {
			w.WriteHeader(404)
			w.Write([]byte("404 Not found"))
		}
	})
	mux.HandleFunc("GET /ping", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
		w.Write(fmt.Append([]byte{}, "pong"))
	})
	mux.HandleFunc("GET /testfile", func(w http.ResponseWriter, r *http.Request) {
		testfile, err := fixturesFS.ReadFile("test/fixtures/layers/user1/base/index.html")
		if err != nil {
			w.WriteHeader(500)
			panic(err)
		}
		num, err := w.Write(testfile)
		fmt.Printf("Wrote %d\n", num)
		if err != nil {
			w.WriteHeader(500)
			panic(err)
		}
		w.WriteHeader(200)
	})
	return mux
}

func main() {
	r := setupRouter()
	r.ListenAndServe()
}
