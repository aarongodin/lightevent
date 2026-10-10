# LightEvent

LightEvent is open source, self-hosted and free event management software.

> *Beta Software Notice*: LightEvent is currently in beta. You can read more about this on the notes for the [v0.1.0]() release.

## Overview

The LightEvent system is comprised of two core components:

* A server application executed through the `lightevent` binary. The admin UI is embedded in the binary and served by it.
* An embedded client application executed through JS and CSS files included on your website. *(In development.)*

## Features

The features are focused on a simple experience, both for customer interaction and administration.

* **Events** - An event is a container for one or many event dates. Members register for a single date or for every date of an event, with an optional capacity per date.
* **Authentication** - Passwordless authentication for members using one-time codes sent by email. Administrators sign in with a username and password; integrations use API keys.
* **Notifications** - Members receive verification codes and registration confirmations by email (SMTP).

Planned:

* **Multi-location support** - Manage events for multiple physical or virtual locations, including role-based access control (RBAC) for administrator access to individual locations.
* **Payments** - Payment policies allow collection of payment for event registration through the [Stripe](https://stripe.com) integration.
* **SMS** - One-time codes and notifications by SMS.

### Technical Features

* **Single binary** - Download a single binary to your desired OS or environment and run it however you want. Example setups for bare-metal/VPS, Docker, and Kubernetes are available, or use these as a starting point for your own solution.
* **Embedded storage** - Uses SQLite (through a pure-Go driver, so the binary has no C dependencies) for embedded storage, so there's no DBMS to manage. Backups and replication for read-replicas could be done with [Litestream](https://litestream.io/).
* **Tidy web footprint** - LightEvent aims at keeping the client application as small as possible to ensure fast load time.
* **RPC API with Connect** - Augment LightEvent with your own integrations using the API. LightEvent is built using [Connect](https://connectrpc.com), an RPC framework built on [protobuf](https://github.com/protocolbuffers/protobuf) that also accepts plain JSON over HTTP.

### GitHub Project

Check out status of requested and planned features in our GitHub project!

## Getting Started

Download or build the `lightevent` binary (see the [Contributing Guide](./CONTRIBUTING.md) to build from source), then start it with a database path and the credentials for the first administrator:

```sh
DATABASE_FILE=/var/lib/lightevent/lightevent.sqlite3 \
BOOTSTRAP_USERNAME=admin \
BOOTSTRAP_PASSWORD='a-long-random-password' \
./lightevent
```

Open `http://localhost:8080` and sign in. Once the first user exists, remove `BOOTSTRAP_PASSWORD` from the environment. LightEvent expects to be served over HTTPS (for example behind a reverse proxy); session cookies are marked `Secure` unless `COOKIE_SECURE=false`.

To let members verify their email address and receive confirmations, configure SMTP:

```sh
EMAIL_PROVIDER=smtp
EMAIL_SMTP_HOST=smtp.example.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USERNAME=...
EMAIL_SMTP_PASSWORD=...
EMAIL_SMTP_SENDER="Your Studio <noreply@example.com>"
```

All configuration options are documented in [`internal/config/runtime.go`](./internal/config/runtime.go) and [`.envrc-example`](./.envrc-example).

## Testing Process

The server has unit tests for every package (`make test`). API tests live in `e2e/`, and browser tests with [Playwright](https://playwright.dev/) are planned.

## Contributing

Welcoming any contributions! See the [Contributing Guide](./CONTRIBUTING.md) to begin.
