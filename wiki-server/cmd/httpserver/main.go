package main

import (
	"fmt"
	"github.com/reedspool/html-wiki-two/wiki-server/wiki"
	"log"
	"net/http"
	"path"
)

const (
	fixtureFSRoot string = "wiki/testdata/fixtures/layers"
)

func user1NoAuthConfig() wiki.Config {
	user := "user1"
	baseLayer := wiki.Layer{
		User:               user,
		Name:               "base",
		ActualFilePathRoot: path.Join(fixtureFSRoot, user, "base"),
	}
	secondLayer := wiki.Layer{
		User:               user,
		Name:               "second",
		ActualFilePathRoot: path.Join(fixtureFSRoot, user, "second"),
	}
	return wiki.NoAuthConfig{User: user, Layers: []wiki.Layer{baseLayer, secondLayer}}
}

func main() {
	port := "8080"
	fmt.Printf("Listening on port %s\n", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), wiki.Wiki(user1NoAuthConfig())))
}
