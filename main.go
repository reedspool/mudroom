package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type layer struct {
	user, name, actualFilePathRoot string
}

type EmptyConfig struct{}

func (EmptyConfig) Layer(name string) (lyr layer, found bool) { return }

type NoAuthConfig struct {
	user   string
	layers []layer
}

func (c NoAuthConfig) Layer(name string) (lyr layer, found bool) {
	for _, lyr = range c.layers {
		if lyr.name == name {
			return lyr, true
		}
	}
	return
}

type Config interface {
	Layer(name string) (lyr layer, found bool)
}

type server struct {
	config Config
}

func NewHandler(config Config) *server {
	return &server{config}
}

type fileContents []byte

func (s server) readFile(path string) (contents fileContents, err error) {
	relativeFilePath := strings.TrimPrefix(path, "/")
	lyr, found := s.config.Layer("base")
	if !found {
		return nil, fmt.Errorf("Can't find layer: %s", "base")
	}
	fullPath := filepath.Join(lyr.actualFilePathRoot, relativeFilePath)

	if _, err := os.Stat(fullPath); err != nil {
		if !os.IsNotExist(err) {
			fmt.Printf("File read error wasn't `os.IsNotExist`: %+v", err)
		}
		return contents, err
	}
	return os.ReadFile(fullPath)
}

func (s server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	hasReflect := r.URL.Query().Has("reflect")

	if hasReflect && r.Method == "GET" {
		w.WriteHeader(200)
		w.Write(fmt.Appendf([]byte{}, "%+v", r.URL.Query()))
	} else if r.Method == "GET" {
		fileContents, err := s.readFile(r.URL.Path)
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
	log.Fatal(http.ListenAndServe(":8080", NewHandler(EmptyConfig{})))
}
