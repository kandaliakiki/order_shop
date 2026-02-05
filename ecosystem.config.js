module.exports = {
  apps: [
    {
      name: "bakeryhub-client",
      cwd: "./client",
      script: "npm",
      args: "start",
      env: {
        PORT: 3018,
        NODE_ENV: "production",
      },
      error_file: "./logs/client-error.log",
      out_file: "./logs/client-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
    },
    {
      name: "bakeryhub-server",
      cwd: "./server",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
      error_file: "./logs/server-error.log",
      out_file: "./logs/server-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
    },
  ],
};
