package wiki

import (
	"testing"

	"github.com/hexops/autogold/v2"
	"github.com/stretchr/testify/assert"
)

func Test_emptyConfig(t *testing.T) {
	config := EmptyConfig{}

	t.Run("Empty config .Layer is never found", func(t *testing.T) {
		lyr, found := config.Layer("anything")
		assert.Equal(t, Layer{}, lyr)
		assert.Equal(t, false, found)
	})

	t.Run("Empty config .GetFile always errors", func(t *testing.T) {
		contents, err := config.GetFile("any/path")
		assert.Equal(t, fileContents(nil), contents)
		autogold.Expect("Cannot get file any/path in empty config").Equal(t, err.Error())
	})
}

func Test_user1(t *testing.T) {
	config := user1NoAuthConfig()

	t.Run("User1's config non-existant .Layer not found", func(t *testing.T) {
		lyr, found := config.Layer("nonexistant")
		assert.Equal(t, Layer{}, lyr)
		assert.Equal(t, false, found)
	})

	t.Run("User1's config base .Layer found", func(t *testing.T) {
		lyr, found := config.Layer("base")
		autogold.Expect(Layer{user: "user1", name: "base", actualFilePathRoot: "testdata/fixtures/layers/user1/base"}).Equal(t, lyr)
		assert.Equal(t, true, found)
	})

	t.Run("User1's config second .Layer found", func(t *testing.T) {
		lyr, found := config.Layer("second")
		autogold.Expect(Layer{user: "user1", name: "second", actualFilePathRoot: "testdata/fixtures/layers/user1/second"}).Equal(t, lyr)
		assert.Equal(t, true, found)
	})

	// user1BaseIndexHtml := mustReadFile(t, "user1/base/index.html")
	user1BaseUnshadowedHtml := mustReadFile(t, "user1/base/unshadowed.html")
	user1SecondIndexHtml := mustReadFile(t, "user1/second/index.html")

	t.Run("User1's config GetFile index.html is shadowed in second ", func(t *testing.T) {
		contents, err := config.GetFile("index.html")
		assert.Equal(t, user1SecondIndexHtml, string(contents))
		assert.Equal(t, nil, err)
	})

	t.Run("User1's config GetFile unshadowed.html is indeed unshadowed", func(t *testing.T) {
		contents, err := config.GetFile("unshadowed.html")
		assert.Equal(t, user1BaseUnshadowedHtml, string(contents))
		assert.Equal(t, nil, err)
	})
}
