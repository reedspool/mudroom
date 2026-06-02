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

type Config interface {
	Layer(name string) (lyr Layer, found bool)
	GetFile(relativePath string) (contents fileContents, err error)
	GetFileFrom(relativePath string, layerSpecifier string) (contents fileContents, err error)
}

type EmptyConfig struct{}

type NoAuthConfig struct {
	user   string
	layers []Layer
}

// Empty config has no layers, no files
func (EmptyConfig) Layer(name string) (lyr Layer, found bool) { return }
func (EmptyConfig) GetFile(relativePath string) (contents fileContents, err error) {
	return nil, fmt.Errorf("Cannot get file %s in empty config", relativePath)
}
func (EmptyConfig) GetFileFrom(relativePath string, layerSpecifier string) (contents fileContents, err error) {
	return nil, fmt.Errorf("Cannot get file %s (from %s) in empty config", relativePath, layerSpecifier)
}

func (c NoAuthConfig) Layer(name string) (lyr Layer, found bool) {
	for _, lyr := range c.layers {
		if lyr.name == name {
			return lyr, true
		}
	}
	return
}

func (c NoAuthConfig) readFile(path string) (contents fileContents, err error) {
	return os.ReadFile(path)
}

// Returns full path of file in first layer in which it exists, or not found err
func (c NoAuthConfig) findFileInAnyLayer(path string) (fullPath string, err error) {
	for _, lyr := range slices.Backward(c.layers) {
		if fullPath, found := c.maybeFindFileInLayer(lyr, path); found {
			return fullPath, nil
		}
	}

	return "", fmt.Errorf("not found in any layer: %s", path)
}

func (c NoAuthConfig) maybeFindFileInLayer(lyr Layer, path string) (fullPath string, found bool) {
	relativeFilePath := strings.TrimPrefix(path, "/")
	fullPath = filepath.Join(lyr.actualFilePathRoot, relativeFilePath)
	if _, err := os.Stat(fullPath); err != nil {
		if !os.IsNotExist(err) {
			fmt.Printf("File read error wasn't `os.IsNotExist`: %+v", err)
		}
		return "", false
	}
	return fullPath, true
}

func (c NoAuthConfig) getLayerBySpecifier(specifier string) (lyr Layer, err error) {
	split := strings.Split(specifier, "/")
	user := split[0]
	name := split[1]
	for _, lyr := range slices.Backward(c.layers) {
		if lyr.name == name && lyr.user == user {
			return lyr, nil
		}
	}
	return lyr, fmt.Errorf("No layer in config with specifier %s", specifier)
}

// Returns full path of file in first layer in which it exists, or not found err
func (c NoAuthConfig) GetFile(relativePath string) (contents fileContents, err error) {
	if fullPath, err := c.findFileInAnyLayer(relativePath); err != nil {
		return nil, err
	} else {
		return c.readFile(fullPath)
	}
}
func (c NoAuthConfig) GetFileFrom(relativePath string, layerSpecifier string) (contents fileContents, err error) {
	lyr, err := c.getLayerBySpecifier(layerSpecifier)
	if err != nil {
		return fileContents(nil), err
	}
	fullPath, found := c.maybeFindFileInLayer(lyr, relativePath)
	if !found {
		return nil, fmt.Errorf("No file at path %s in layer %s", relativePath, layerSpecifier)
	}
	return c.readFile(fullPath)
}
