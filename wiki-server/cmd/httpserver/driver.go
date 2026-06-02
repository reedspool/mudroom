package main

import (
	"fmt"
	"io"
	"net/http"
)

type Driver struct {
	BaseURL string
	Client  *http.Client
}

func (d Driver) Get(path string) (string, error) {
	res, err := d.Client.Get(fmt.Sprintf("%s/%s", d.BaseURL, path))
	if err != nil {
		return "", err
	}
	defer res.Body.Close()
	greeting, err := io.ReadAll(res.Body)
	if err != nil {
		return "", err
	}
	return string(greeting), nil
}
