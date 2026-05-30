package wiki

import (
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"strings"
)

type Layer struct {
	user, name, actualFilePathRoot string
}

type EmptyConfig struct{}

func (EmptyConfig) Layer(name string) (lyr Layer, found bool) { return }
func (EmptyConfig) GetFile(relativePath string) (contents fileContents, err error) {
	return nil, fmt.Errorf("Cannot get file %s in empty config", relativePath)
}

type NoAuthConfig struct {
	user   string
	layers []Layer
}

func (c NoAuthConfig) Layer(name string) (lyr Layer, found bool) {
	for _, lyr := range c.layers {
		if lyr.name == name {
			return lyr, true
		}
	}
	return
}

type Config interface {
	Layer(name string) (lyr Layer, found bool)
	GetFile(relativePath string) (contents fileContents, err error)
}

func (c NoAuthConfig) readFile(path string) (contents fileContents, err error) {
	return os.ReadFile(path)
}

// Returns full path of file in first layer in which it exists, or not found err
func (c NoAuthConfig) findFileInAnyLayer(path string) (fullPath string, err error) {
	for _, lyr := range slices.Backward(c.layers) {
		relativeFilePath := strings.TrimPrefix(path, "/")
		fullPath = filepath.Join(lyr.actualFilePathRoot, relativeFilePath)

		if _, err := os.Stat(fullPath); err != nil {
			if !os.IsNotExist(err) {
				fmt.Printf("File read error wasn't `os.IsNotExist`: %+v", err)
			}
			// continue
		} else {
			// No err on os.Stat, so return
			return fullPath, nil
		}
	}

	return "", fmt.Errorf("not found in any layer: %s", path)
}

// Returns full path of file in first layer in which it exists, or not found err
func (c NoAuthConfig) GetFile(relativePath string) (contents fileContents, err error) {
	if fullPath, err := c.findFileInAnyLayer(relativePath); err != nil {
		return nil, err
	} else {
		return c.readFile(fullPath)
	}
}
