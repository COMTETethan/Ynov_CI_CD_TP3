/* eslint-disable no-undef */
import net from "node:net";

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

function getDatabaseHostAndPort() {
  try {
    const databaseUrl = new URL(process.env.DATABASE_URL);
    return {
      host: databaseUrl.hostname,
      port: Number.parseInt(databaseUrl.port || "5432", 10),
    };
  } catch {
    return null;
  }
}

function checkTcpConnection(host, port, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    const cleanup = (result) => {
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => cleanup(true));
    socket.once("timeout", () => cleanup(false));
    socket.once("error", () => cleanup(false));
    socket.connect(port, host);
  });
}

export async function checkDatabaseHealth() {
  if (!isDatabaseConfigured()) {
    return false;
  }

  const target = getDatabaseHostAndPort();

  if (!target) {
    return false;
  }

  return checkTcpConnection(target.host, target.port);
}
