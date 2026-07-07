package wiki

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
)

type wiki struct {
	config Config
}

func Wiki(config Config) http.Handler {
	return &wiki{config}
}

type fileContents []byte

var emptyResponse = []byte{}
var notFoundText = []byte("404 Not found")
var badRequestText = []byte("Bad request")

func (s wiki) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	inputs := NewInputs()
	inputs.AddAllUrlQueryValues(r.URL.Query())
	body, status := s.handleRequest(w, r.Method, r.URL.Path, inputs)
	w.WriteHeader(status)
	w.Write(body)
}

func (s wiki) handleRequest(w io.Writer, method string, path string, inputs Inputs) (body []byte, status int) {
	if inputs.Has("reflect") && method == "GET" {
		return fmt.Appendf([]byte{}, "%+v", inputs), http.StatusOK
	}

	if method == "GET" {
		fileContents, err := s.getFileContents(path, inputs)
		if err != nil {
			fmt.Println("Error on getFileContents:", err)
			return notFoundText, http.StatusNotFound
		}

		renderedContent, err := passThroughTemplater(string(fileContents))

		if err != nil {
			panic(err)
		}

		if _, err := w.Write(renderedContent); err != nil {
			panic(err)
		}
		return emptyResponse, http.StatusOK
	}

	return badRequestText, http.StatusBadRequest
}

func (s wiki) getFileContents(path string, inputs Inputs) (contents fileContents, err error) {
	if inputs.Has("layer") {
		return s.config.GetFileFrom(path, inputs.MustGet("layer"))
	} else {
		return s.config.GetFile(path)
	}
}

// TODO: Pass in some configuration for how to contact the templating service.
func passThroughTemplater(content string) (result []byte, err error) {
	resp, err := http.PostForm("http://localhost:8000/", url.Values{"content": {content}})
	if err != nil {
		return nil, err
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return body, nil
}
