GO_PACKAGES := ./cmd/... ./internal/... ./admin ./client
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

.PHONY: dev-client
dev-client: ## Run the client app playground on http://localhost:5600 (calls the Go server)
	@npm -w client run dev

.PHONY: generate
generate: ## Regenerate protobuf/Connect code (Go + TypeScript) and sqlc storage code
	@$(TOOL) buf lint
	@$(TOOL) buf generate
	@$(TOOL) sqlc generate

.PHONY: build-admin
build-admin: ## Build the admin UI and login page CSS into admin/dist
	@npm -w admin run build

.PHONY: build-client
build-client: ## Build the client app into client/dist and check its size budget
	@npm -w client run build

.PHONY: build-server
build-server: ## Build the server binary (embeds admin/dist and client/dist) into bin/lightevent
	@CGO_ENABLED=0 go build -trimpath -o bin/lightevent ./cmd/server

.PHONY: build
build: build-admin build-client build-server ## Build the admin UI, the client app and the server binary

.PHONY: test
test: ## Run Go unit tests
	@go test -race $(GO_PACKAGES)

.PHONY: lint
lint: ## Run Go vet, buf lint, Biome and the TypeScript checker
	@go vet $(GO_PACKAGES)
	@test -z "$$(gofmt -l cmd internal admin/embed.go client/embed.go)" || (gofmt -l cmd internal admin/embed.go client/embed.go; exit 1)
	@$(TOOL) buf lint
	@npx biome check .
	@npm -w admin run typecheck
	@npm -w client run typecheck
	@npm -w e2e run typecheck

.PHONY: format
format: ## Format Go and TypeScript code
	@gofmt -w cmd internal admin/embed.go client/embed.go
	@npx biome check --write .

.PHONY: test-e2e
test-e2e: ## Run the Playwright browser tests (builds the app and starts a test server)
	@npm -w e2e test
