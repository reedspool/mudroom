package wiki

import (
	"net/url"
)

type Inputs map[string]string

func NewInputs() Inputs {
	return make(Inputs)
}

func (in Inputs) Has(key string) bool {
	_, ok := in[key]
	return ok
}

func (in Inputs) Set(key string, value string) {
	in[key] = value
}

func (in Inputs) Get(key string) (string, bool) {
	value, ok := in[key]
	return value, ok
}

func (in Inputs) MustGet(key string) string {
	value, _ := in[key]
	return value
}

func (in Inputs) AddAllUrlQueryValues(values url.Values) {
	for key, value := range values {
		in.Set(key, value[0])
	}
}
