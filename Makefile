server:
	@go build -o bin/lightevent cmd/server/main.go

download:
	@echo Download go.mod dependencies
	@go mod download

install-tools: download
	@echo Installing tools from tools.go
	@cat tools.go | grep _ | awk -F'"' '{print $$2}' | xargs -tI % go install %

protoc:
	@echo Compiling rpc/lightevent/service.proto
	@mkdir ./generated
	@protoc \
		--twirp_out=. \
		--go_out=. \
		--plugin=protoc-gen-ts_proto=./node_modules/.bin/protoc-gen-ts_proto \
    --plugin=protoc-gen-twirp_ts=./node_modules/.bin/protoc-gen-twirp_ts \
    --ts_proto_opt=esModuleInterop=true \
    --ts_proto_opt=outputClientImpl=false \
    --ts_proto_out=./generated \
    --twirp_ts_opt="ts_proto" \
    --twirp_ts_out=./generated \
		rpc/lightevent/service.proto
	@cp ./generated/rpc/lightevent/* admin/src/rpc/
	@cp ./generated/rpc/lightevent/* e2e/src/rpc/
	@rm -rf ./generated

test-api:
	@npm -w e2e run test:api
