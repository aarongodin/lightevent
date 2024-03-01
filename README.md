# LightEvent

LightEvent is open source, self-hosted and free event management software.

> *Beta Software Notice*: LightEvent is currently in beta. You can read more about this on the notes for the [v0.1.0]() release.

## Overview

The LightEvent system is comprised of two core components:

* A server application executed through the `lightevent` binary. This also serves the admin UI.
* An embedded client application executed through JS and CSS files included on your website.

## Features

The features are focused on a simple experience, both for customer interaction and administration.

* **Events** - An event is a container for one or many event dates - either a single date, multiple dates, or more complex schedules.
* **Multi-location support** - Manage events for multiple physical or virtual locations, including role-based access control (RBAC) for administrator access to individual locations.
* **Authentication** - Lightweight and secure identity management with passwordless authentication for members (OTP via email or SMS).
* **Payments** - Payment policies allow collection of payment for event registration through the [Stripe](https://stripe.com) integration.
* **Notifications** - User and member notifications are available through both email and SMS.

### Technical Features

* **Single binary** - Download a single binary to your desired OS or environment and run it however you want. Example setups for bare-metal/VPS, Docker, and Kubernetes are available, or use these as a starting point for your own solution.
* **Embedded storage** - Uses sqlite for embedded storage, so there's no DBMS to manage. Backups and replication for read-replicas could be done with [Litestream](https://litestream.io/).
* **Tidy web footprint** - LightEvent aims at keeping the client application as small as possible to ensure fast load time.
* **RPC API with Twirp** - Augment LightEvent with your own integrations using the API. LightEvent is built using [Twirp](https://github.com/twitchtv/twirp), an awesome RPC framework built on [protobuf](https://github.com/protocolbuffers/protobuf).

### GitHub Project

Check out status of requested and planned features in our GitHub project!

## Getting Started

To install and try LightEvent, follow [the Getting Started guide]().

## Testing Process

Each release of LightEvent is heavily tested through a set of automated integration tests. We are using [Playwright](https://playwright.dev/) to test through multiple browsers on each release to ensure a consistent and bug-free experience between common browsers.

You can read more about the testing process [on the website]().

## Contributing

Welcoming any contributions! See the [Contributing Guide](./CONTRIBUTING.md) to begin.
