package adapters

import (
	"context"
	"testing"

	// "github.com/moby/moby/api/types/build"
	// "github.com/moby/moby/client"
	"github.com/alecthomas/assert/v2"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

func StartDockerServer(
	t testing.TB,
	port string,
	dockerFilePath string,
) (mappedPort uint16) {
	ctx := context.Background()

	req := testcontainers.ContainerRequest{
		// Was hoping if I kept this mount around it would improve the build time, but it didn't
		Mounts: testcontainers.ContainerMounts{testcontainers.ContainerMount{Source: testcontainers.GenericVolumeMountSource{Name: "test-volume"}, Target: testcontainers.ContainerMountTarget("/root/.cache/go-build"), ReadOnly: false}},
		FromDockerfile: testcontainers.FromDockerfile{
			KeepImage:  true,
			Context:    "../../.",
			Dockerfile: dockerFilePath,

			// set to false if you want less spam, but this is helpful if you're having troubles
			PrintBuildLog: true,

			// See note about BuildKit caching in Dockerfile
			// Tried from https://github.com/testcontainers/testcontainers-go/discussions/573#discussioncomment-14078598
			// but ran into other issues
			// BuildOptionsModifier: func(buildOptions *client.ImageBuildOptions) {
			// 	buildOptions.Version = build.BuilderBuildKit
			// },
		},
		// TODO: Use passed port
		ExposedPorts: []string{"8080/tcp"},
		WaitingFor:   wait.ForHTTP("/").WithStatusCodeMatcher(func(status int) bool { return true }).WithPort("8080"),
	}
	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	assert.NoError(t, err, "If this failed with 'permission denied while trying to connect to the docker API', then you might need 'sudo usermod -a -G docker $USER' and log out+in or 'newgrp docker' for now")
	t.Cleanup(func() {
		assert.NoError(t, container.Terminate(ctx))
	})

	mapped8080, err := container.MappedPort(ctx, "8080/tcp")
	assert.NoError(t, err)
	return mapped8080.Num()
}
