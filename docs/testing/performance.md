# performance tests for lightevent server

Performance testing is run through [k6](https://k6.io). Only the server needs to be running, but pay attention to options for the server required for specific tests.

These are mostly here to spot check response times on already large instances of lightevent. It can be helpful to run before and after a crucial change that may impact performance for any critical path request.

## Auth

### `k6/cookie-auth.js`

This test attempts to check how many concurrent cookie-based sessions can be created and deleted in a given timeframe. Each user performs a login, a ping check and a logout.

Run the server with special arguments to disble secure cookies:

```
COOKIE_SECURE=false make start
```

In a separate window, run the cookie auth test with something like:

```
k6 run -u 5 -d 10s k6/cookie-auth.js
```

