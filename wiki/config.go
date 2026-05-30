package wiki

type Layer struct {
	user, name, actualFilePathRoot string
}

type EmptyConfig struct{}

func (EmptyConfig) Layer(name string) (lyr Layer, found bool) { return }

type NoAuthConfig struct {
	user   string
	layers []Layer
}

func (c NoAuthConfig) Layer(name string) (lyr Layer, found bool) {
	for _, lyr = range c.layers {
		if lyr.name == name {
			return lyr, true
		}
	}
	return
}

type Config interface {
	Layer(name string) (lyr Layer, found bool)
}
