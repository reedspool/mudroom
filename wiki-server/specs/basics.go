package specs

import (
	"testing"

	"github.com/alecthomas/assert/v2"
)

type Getter interface {
	Get(path string) (string, error)
}

func GetLiteralPagesSpecification(t *testing.T, getter Getter) {
	got, err := getter.Get("")
	assert.NoError(t, err)
	assert.Equal(t, got, "404 Not found")
}
