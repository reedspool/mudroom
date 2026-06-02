# HTML Wiki Two

[github.com/reedspool/html-wiki-two](https://github.com/reedspool/html-wiki-two)

Experimental web server in golang.

## Tasks

[![xc compatible](https://xcfile.dev/badge.svg)](https://xcfile.dev)

### Run

```sh
go run cmd/httpserver/main.go
```

### Test

```sh
go test ./...
```

### clear-test

Clear the terminal then run `go test`

```sh
clear
go test wiki/*.go
```

### test-watch

Requires [`fswatch`](https://github.com/emcrisostomo/fswatch). Can test the name of the flag to put after `--event` in your system with `fswatch -x`.

```sh
xc clear-test || true # Continue even on failure
fswatch --one-per-batch --recursive --latency 0.1 --event Updated . | xargs -I{} xc clear-test
```

### test-update

Tell [`autogold`](https://github.com/hexops/autogold) to update all "golden" values/files in tests. Also removes any tests which are no longer used. The `git diff` is there to suggest a workflow concept.

```sh
go test ./... -clean -update 
git diff **/*_test.go
```

### docker-build-and-run

```sh
docker build -t html-wiki-two -f cmd/httpserver/Dockerfile .
docker run -p 8080:8080 html-wiki-two:latest
```
