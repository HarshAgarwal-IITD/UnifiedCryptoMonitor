module.exports = {
  apps: [
    {
      name: "http-server",
      script: "./dist/index.js",
      cwd: "./apps/http-server",
    },
    {
      name: "ws-server",
      script: "./dist/index.js",
      cwd: "./apps/ws-server",
    },
    {
      name: "web",
      script: "npm",
      args: "start",
      cwd: "./apps/web",
    },
  ],
};
