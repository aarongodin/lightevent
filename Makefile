download:
	@echo Download go.mod dependencies
	@go mod download

install-tools: download
	@echo Installing tools from tools.go
	@cat tools.go | grep _ | awk -F'"' '{print $$2}' | xargs -tI % go install %

protoc:
	@echo Compiling rpc/spectral/service.proto
	@protoc --twirp_out=. --go_out=. rpc/spectral/service.proto