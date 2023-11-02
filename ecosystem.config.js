// This file is used by a process manager called pm2: https://pm2.keymetrics.io/
// It is for local development only and is not part of the production application.

module.exports = {
	apps: [
		{
			name: "admin-dev",
			cwd: "./admin",
			script: "npm",
			args: "run dev"
		},
		{
			name: "admin-dev-login-css",
			cwd: "./admin",
			script: "npm",
			args: "run dev:login-css"
		},
		{
			name: "client-dev",
			cwd: "./client",
			script: "npm",
			args: "run dev"
		},
	]
}
