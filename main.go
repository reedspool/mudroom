package main

import (
	"github.com/reedspool/html-wiki-two/wiki"
	"log"
	"net/http"
)

func main() {
	log.Fatal(http.ListenAndServe(":8080", wiki.Wiki(wiki.EmptyConfig{})))
}
