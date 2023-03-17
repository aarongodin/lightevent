# Contributing to Spectral

Any level of contribution is welcome, and we want it to be easy to engage with the development of the project. Contributions come in all shapes and sizes, from one-line documentation fixes to major features or bugfixes. If you're new to web software or open source, this is a great project to start with because it applies almost all of the most common practices in web development.

## Versioning

This project follows [Semver](https://semver.org/). Generally speaking, we will avoid breaking changes whenever possible. You can find release notes on the [Releases](https://github.com/aarongodin/spectral/releases) page.

## Issues

The [issues](https://github.com/aarongodin/spectral/issues) section of GitHub is for bug tracking and feature requests.

### Bugs

When submitting a bug report, please follow the issue template and fill it out. It makes it much easier for the maintainers to understand the issue at hand. Critical bugs will be addressed as soon as possible, but there are no guarantees for turnaround time. Minor issues will usually be rolled into a new version when it's appropriate to release the next version.

## Developer Guide

Here's a quick guide to running the project locally.

### Prerequisites

* [go 1.19](https://go.dev/)
* [protoc](https://grpc.io/docs/protoc-installation/) (the protobuf compiler)
* [node 16 or higher](https://nodejs.org/en)
* [pm2](https://pm2.keymetrics.io/) - optional for easier management of web app builds

### Project setup

Install the required protoc plugins with:

```sh
make install-tools
```

This adds some binaries to your go `bin` folder, so be sure that this is added to your path. If you've installed go programs before with `go install ...` then you should be set. Otherwise, [see guides](https://www.digitalocean.com/community/tutorials/how-to-build-and-install-go-programs#step-5-installing-go-programs-with-go-install) on how to configure this.

After that's complete, you can start the service with:

```sh
go run cmd/server/main.go
```

When you make changes to any protobuf documents, you can rebuild the go and typescript clients using:

```sh
make protoc
```

Running the client and admin apps can be done with pm2:

```sh
# todo
```

## Pull Requests

When you have a change to propose, follow the standard pull request workflow by forking this repo, pushing to a branch in your fork, and opening a PR in this repo using your fork and branch as the source.

Please fill out the information in the default PR description as it makes it easier to scan and understand what has changed, as well as ensure that criteria for making a change have been met.
