/* eslint-disable no-undef */
import net from "node:net";

export function isRedisConfigured() {
  return Boolean(process.env.REDIS_URL);
}

function getRedisHostAndPort() {
  try {
    const redisUrl = new URL(process.env.REDIS_URL);
    return {
      host: redisUrl.hostname,
      port: Number.parseInt(redisUrl.port || "6379", 10),
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

export async function checkRedisHealth() {
  if (!isRedisConfigured()) {
    return false;
  }

  const target = getRedisHostAndPort();

  if (!target) {
    return false;
  }

  return checkTcpConnection(target.host, target.port);
}
