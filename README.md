# spectral

Spectral is an open source & self-hosted alternative to complex/expensive class & event management software. The system is comprised of the following components:

* Server application written in go
* Admin UI served by the Server application
* Embeddable client application for the browser (integrates into any website with a short code snippet)

## Features

The features are intended to be laser-focused on offering a simple experience, both for customer interaction and administration.

* **Simple data model** - Support for 1-time events, events series, and schedules. Find out more about events and schedules in [our docs]().
* **Authentication** - Lightweight identity management through passwordless authentication for members (OTP via email).
* **Payments** - Accept payments after the user has registered. Currently [Square](https://squareup.com) and [Stripe](https://stripe.com/) are the supported payment providers.
* **Notifications** - Well-tested and customizable emails are sent for registration confirmation.
* **Reporting** - Get at-a-glance information about event registrations, or use the complete reports for more comprehensive data.

### Technical Features

* **Single binary** - Download a single binary and run it however you want.
* **Embedded storage** - Uses sqlite through for embedded storage, so there's no DBMS to manage. Backups and replication for read-replicas could be done with [Litestream](https://litestream.io/).
* **Tidy web footprint** - Spectral aims at keeping the client application as small as possible to ensure fast load time.
* **RPC API with Twirp** - Augment Spectral with your own integrations using the API. Spectral is built using [Twirp](https://github.com/twitchtv/twirp), a fantastic RPC framework built on [protobuf](https://github.com/protocolbuffers/protobuf).

### GitHub Project

Check out status of requested and planned features in our GitHub project!

## Getting Started

To install and try Spectral, follow [the Getting Started guide]().

## Testing Process

Each release of Spectral is heavily tested through a set of automated integration tests. We are using [Playwright](https://playwright.dev/) to test through multiple browsers on each release to ensure a consistent and bug-free experience between common browsers.

You can read more about the testing process [on the website]().

## Contributing

Welcoming any contributions! See the [Contributing Guide](./CONTRIBUTING.md) to begin.
