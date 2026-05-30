package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
)

const (
	testFixtureFSRoot string = "test/fixtures/layers"
)

type server struct{}

func NewHandler() *server {
	return &server{}
}

type fileContents []byte

func readFile(path string) (contents fileContents, err error) {
	relativeFilePath := strings.TrimPrefix(path, "/")
	fullPath := fmt.Sprintf("%s/%s", testFixtureFSRoot, relativeFilePath)

	if _, err := os.Stat(fullPath); err != nil {
		if !os.IsNotExist(err) {
			fmt.Printf("File read error wasn't `os.IsNotExist`: %+v", err)
		}
		return contents, err
	}
	return os.ReadFile(fullPath)
}

func (server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	hasReflect := r.URL.Query().Has("reflect")

	if hasReflect && r.Method == "GET" {
		w.WriteHeader(200)
		w.Write(fmt.Appendf([]byte{}, "%+v", r.URL.Query()))
	} else if r.Method == "GET" {
		fileContents, err := readFile(r.URL.Path)
		if err != nil {
			w.WriteHeader(404)
			w.Write([]byte("404 Not found"))
			return
		}
		if _, err := w.Write(fileContents); err != nil {
			w.WriteHeader(500)
			panic(err)
		}
		w.WriteHeader(200)
	} else {
		w.WriteHeader(404)
		w.Write([]byte("404 Not found"))
	}
}

func main() {
	log.Fatal(http.ListenAndServe(":8080", NewHandler()))
}
