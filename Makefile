start:
	@echo Starting server... tip: check the contributing guide for using air
	@go run ./cmd/server/main.go

build-server:
	@go build -o bin/lightevent cmd/server/main.go

download:
	@echo Download go.mod dependencies
	@go mod download

install-tools: download
	@echo Installing tools from tools.go
	@cat tools.go | grep _ | awk -F'"' '{print $$2}' | xargs -tI % go install %

mkcert:
	@mkdir -p .cert && mkcert -key-file ./.cert/key.pem -cert-file ./.cert/cert.pem 'localhost'

protoc:
	@echo Compiling rpc/lightevent/service.proto
	@rm -rf ./.protoc-tmp && mkdir ./.protoc-tmp
	@protoc \
		--twirp_out=. \
		--go_out=. \
		--plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto \
    --plugin=protoc-gen-twirp_ts=./node_modules/.bin/protoc-gen-twirp_ts \
    --ts_proto_opt=esModuleInterop=true \
    --ts_proto_opt=outputClientImpl=false \
    --ts_proto_out=./.protoc-tmp \
    --twirp_ts_opt="ts_proto" \
    --twirp_ts_out=./.protoc-tmp \
		rpc/lightevent/service.proto
	@cp ./.protoc-tmp/rpc/lightevent/* admin/src/rpc/
	@cp ./.protoc-tmp/rpc/lightevent/* e2e/src/rpc/
	@rm -rf ./.protoc-tmp

test-api:
	@npm -w e2e run test:api
