download:
	@echo Download go.mod dependencies
	@go mod download

install-tools: download
	@echo Installing tools from tools.go
	@cat tools.go | grep _ | awk -F'"' '{print $$2}' | xargs -tI % go install %

protoc:
	@echo Compiling rpc/spectral/service.proto
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
		rpc/spectral/service.proto
	@cp ./generated/rpc/spectral/* admin/src/rpc/
	@rm -rf ./generated