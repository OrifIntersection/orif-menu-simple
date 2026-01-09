module.exports = {
  apps: [
    {
      name: "menu-cafet",
      script: "server/index.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production"
      },
      out_file: "/var/log/menu-cafet/out.log",
      error_file: "/var/log/menu-cafet/error.log",
      merge_logs: true,
      time: true
    }
  ]
};
