package wiki

import (
	"net/url"
	"testing"

	"github.com/alecthomas/assert/v2"
)

func TestInputs_empty(t *testing.T) {
	inputs := NewInputs()
	assert.Equal(t, false, inputs.Has("abcd"))
}

func TestInputs_setAndGet(t *testing.T) {
	inputs := NewInputs()
	inputs.Set("abcd", "yes")
	assert.Equal(t, true, inputs.Has("abcd"))
	value, found := inputs.Get("abcd")
	assert.Equal(t, true, found)
	value = inputs.MustGet("abcd")
	assert.Equal(t, "yes", value)

	value = inputs.MustGet("unknown")
	assert.Equal(t, true, found)
	assert.Equal(t, "", value)
}

func TestInputs_fromQueryValues(t *testing.T) {
	values := make(url.Values)
	key1, value1 := "query1", "value1"
	key2, value2 := "query2", "value2"
	appendToUrlValues(&values, key1, value1)
	appendToUrlValues(&values, key2, value2)

	inputs := NewInputs()
	inputs.Set(key1, value1) // Overridden

	inputs.AddAllUrlQueryValues(values)
	assert.Equal(t, true, inputs.Has(key1))
	value, found := inputs.Get(key1)
	assert.Equal(t, true, found)
	assert.Equal(t, value1, value)

	assert.Equal(t, true, inputs.Has(key2))
	value, found = inputs.Get(key2)
	assert.Equal(t, true, found)
	assert.Equal(t, value2, value)
}

func appendToUrlValues(values *url.Values, key string, value string) {
	(*values)[key] = append((*values)[key], value)
}
