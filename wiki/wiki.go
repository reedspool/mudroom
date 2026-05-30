package wiki

import (
	"fmt"
	"net/http"
)

type wiki struct {
	config Config
}

func Wiki(config Config) http.Handler {
	return &wiki{config}
}

type fileContents []byte

func (s wiki) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	hasReflect := r.URL.Query().Has("reflect")

	if hasReflect && r.Method == "GET" {
		w.WriteHeader(200)
		w.Write(fmt.Appendf([]byte{}, "%+v", r.URL.Query()))
	} else if r.Method == "GET" {
		fileContents, err := s.config.GetFile(r.URL.Path)
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
