GO_PACKAGES := ./cmd/... ./internal/... ./admin
TOOL := go tool -modfile=tools/go.mod

.PHONY: help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-16s %s\n", $$1, $$2}'

.PHONY: install
install: ## Install Go modules and npm packages
	@go mod download
	@go mod download -modfile=tools/go.mod
	@npm ci

.PHONY: start
start: ## Run the server from source (uses the admin UI last built into admin/dist)
	@go run ./cmd/server

.PHONY: dev-admin
dev-admin: ## Run the admin UI dev server on http://localhost:5500 (proxies to the Go server)
	@npm -w admin run dev

.PHONY: generate
generate: ## Regenerate protobuf/Connect code (Go + TypeScript) and sqlc storage code
	@$(TOOL) buf lint
	@$(TOOL) buf generate
	@$(TOOL) sqlc generate

.PHONY: build-admin
build-admin: ## Build the admin UI and login page CSS into admin/dist
	@npm -w admin run build

.PHONY: build-server
build-server: ## Build the server binary (embeds admin/dist) into bin/lightevent
	@CGO_ENABLED=0 go build -trimpath -o bin/lightevent ./cmd/server

.PHONY: build
build: build-admin build-server ## Build the admin UI and the server binary

.PHONY: test
test: ## Run Go unit tests
	@go test -race $(GO_PACKAGES)

.PHONY: lint
lint: ## Run Go vet, buf lint, Biome and the TypeScript checker
	@go vet $(GO_PACKAGES)
	@test -z "$$(gofmt -l cmd internal admin/embed.go)" || (gofmt -l cmd internal admin/embed.go; exit 1)
	@$(TOOL) buf lint
	@npx biome check .
	@npm -w admin run typecheck

.PHONY: format
format: ## Format Go and TypeScript code
	@gofmt -w cmd internal admin/embed.go
	@npx biome check --write .

.PHONY: mkcert
mkcert: ## Generate local TLS certificates (used only by the client app dev server)
	@mkdir -p .cert && mkcert -key-file ./.cert/key.pem -cert-file ./.cert/cert.pem 'localhost'

.PHONY: test-api
test-api: ## Run the API tests in e2e/ against a running server (needs LIGHTEVENT_API_KEY)
	@npm -w e2e run test:api
