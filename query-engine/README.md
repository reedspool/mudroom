# Query Engnie

This is a Deno server which runs a locked-down JavaScript evaluator to drive an HTML-based query language.

## Requirements

- Docker
- Tested only on deno 2.8.1

## Security

Or lack thereof. This purpose of this engine is to run user-authored JavaScript as uninhibited as is feasible and safe. Anyone who works on this project should be aware of [Deno's security guarantees and gaps](https://docs.deno.com/runtime/fundamentals/security/), and anyone who wants to run this project on their own server probably should not. It's unwise, unsafe, unprotected, ungood.

## Tasks

[![xc compatible](https://xcfile.dev/badge.svg)](https://xcfile.dev)

### Run

Kept up to date with the Dockerfile

```sh
deno task serve
```

### docker-build-and-run

```sh
docker build -t wiki-query-engine .
docker run -p 8000:8000 wiki-query-engine
```

### test

```sh
deno task test
```

### test-watch

```sh
deno task test:watch
```

### inspect-test

Start a step debugger. Deno runs each test file separately which causes a separate debugger server to start. So pick one test file to debug by changing the parameter below.

```sh
deno test --inspect-brk ./main_test.ts
```
