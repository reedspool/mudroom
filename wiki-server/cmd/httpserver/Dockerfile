FROM golang:1.26.3-alpine
# Make sure to specify the same Go version as the one in the go.mod file.
# For example, golang:1.22.1-alpine.

WORKDIR /app

COPY go.mod ./

RUN go mod download

# RUN go mod tidy # just a change to invalidate the docker cache

COPY . .

# Wanted RUN --mount=type=cache,target=/root/.cache/go-build
# To speed up cache but this requires a new BuildKit thing for which the API
# does not seem ready
RUN go build -o server cmd/httpserver/*.go

EXPOSE 8080
CMD [ "./server" ]
