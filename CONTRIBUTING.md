# Contributing to LightEvent

Any level of contribution is welcome, and we want it to be easy to engage with the development of the project. Contributions come in all shapes and sizes, from one-line documentation fixes to major features or bugfixes. If you're new to web software or open source, this is a great project to start with because it applies almost all of the most common practices in web development.

## Versioning

This project follows [Semver](https://semver.org/). Generally speaking, we will avoid breaking changes whenever possible. You can find release notes on the [Releases](https://github.com/aarongodin/lightevent/releases) page.

## Issues

The [issues](https://github.com/aarongodin/lightevent/issues) section of GitHub is for bug tracking and feature requests.

### Bugs

When submitting a bug report, please follow the issue template and fill it out. It makes it much easier for the maintainers to understand the issue at hand. Critical bugs will be addressed as soon as possible, but there are no guarantees for turnaround time. Minor issues will usually be rolled into a new version when it's appropriate to release the next version.

## Developer Guide

### Prerequisites

* [go 1.19](https://go.dev/)
* [protoc](https://grpc.io/docs/protoc-installation/) (the protobuf compiler)
* [node 16 or higher](https://nodejs.org/en)
* [pm2](https://pm2.keymetrics.io/) - optional, for easier management of web app dev servers

### Project setup

Install the required protoc plugins with:

```sh
make install-tools
```

This adds some binaries to your go `bin` folder, so be sure that this is added to your path. If you've installed go programs before with `go install ...` then you should be set. Otherwise, [see the go docs](https://pkg.go.dev/cmd/go#hdr-Compile_and_install_packages_and_dependencies) on how to configure this.

After that's complete, you can start the service with:

```sh
go run cmd/server/main.go
```

There is also an [air](https://github.com/cosmtrek/air) config in the project. After installing air, you can run the server app by running `air` in the directory. This watches for file changes and restarts the server when detected.

The app receives configuration through environment variables. You can set these variables however you want. One recommendation is to use [direnv](https://direnv.net/). Check out `.envrc-example` for a list of variables to set.

When you make changes to any protobuf documents, you can rebuild the go and typescript generated code using:

```sh
make protoc
```

You will need to generate an SSL cert for use by the local dev servers hosting the `admin` and `client` frontend apps. You can do so with the following, assuming you are on macOS and use homebrew:

```sh
brew install mkcert
mkcert -install
make mkcert
```

The certs are gitignored, so if you need to regenerate them for the project, just run `make mkcert` to receive new ones. You will have to restart the dev sever before the new cert is used.

Running the client and admin web apps can be done with pm2. Install the node modules in the root directory, install pm2 globally, and start the dev servers:

```sh
npm i
npm i -g pm2
pm2 start
```

Open the admin app at [https://localhost:5500](https://localhost:5500) and the client app at [https://localhost:6500](https://localhost:6500).

A note about JavaScript package management: this project is using [npm workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces). To install node modules, `npm install` in the root directory. To run any command in context of a workspace, use `-w [workspace]` (e.g. `npm add --dev typescript -w admin`). This also works with `npx`.

### Using the JSON API

The protobuf framework used by LightEvent is [twirp](https://twitchtv.github.io/twirp/). There's also a JSON API, which is used for the client app to avoid sending a protobuf library in the distributed JS. This also makes it easier to test, especially for newcomers to protobuf.

Once you have the server runnning locally, you can access the API on port 8080. Here's an example using httpie to call the Ping RPC:

```
~ http post :8080/rpc/LightEvent/Ping --raw='{}'
HTTP/1.1 401 Unauthorized
Content-Length: 58
Content-Type: application/json
Date: Wed, 21 Jun 2023 20:24:08 GMT

{
    "code": "unauthenticated",
    "msg": "authentication required"
}
```

Since we haven't provided any authentication, we received a 401 status. There are three authentication methods available, so depending on what aspect of the server you are testing, you'll need to authenticate with a credential that is allowed for the given RPC. An API Key is a straightforward way to test most endpoints, or you can use HTTP Basic Auth to provide user credentials.

## Pull Requests

When you have a change to propose, follow the standard pull request workflow by forking this repo, pushing to a branch in your fork, and opening a PR in this repo using your fork and branch as the source.

Please fill out the information in the default PR description as it makes it easier to scan and understand what has changed, as well as ensure that criteria for making a change have been met. If you can link to relevant issues this helps with pruning any issues the PR resolves.
