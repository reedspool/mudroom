package specs

import "fmt"

type GetAdapter func() string
type GetDynamicAdapter func(input string) string

func (g GetAdapter) Get() (string, error) {
	return g(), nil
}
func (g GetAdapter) GetDynamic(input string) (string, error) {
	return "", fmt.Errorf("GetAdapter doesn't implement GetDynamic")
}

func (g GetDynamicAdapter) Get() (string, error) {
	return "", fmt.Errorf("GetDynamicAdapter doesn't implement Get")
}
func (g GetDynamicAdapter) GetDynamic(input string) (string, error) {
	return g(input), nil
}
