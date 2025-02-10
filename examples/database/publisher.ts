import { Context, getPortsForInstance } from '@osaas/client-core';
import {
  createValkeyIoValkeyInstance,
  getValkeyIoValkeyInstance
} from '@osaas/client-services';
import Redis from 'ioredis';

async function setup() {
  const ctx = new Context();
  let valkey = await getValkeyIoValkeyInstance(ctx, 'example');
  if (!valkey) {
    valkey = await createValkeyIoValkeyInstance(ctx, {
      name: 'example',
      Password: 'secret'
    });
  }
  const token = await ctx.getServiceAccessToken('valkey-io-valkey');
  const ports = await getPortsForInstance(
    ctx,
    'valkey-io-valkey',
    'example',
    token
  );
  const port = ports.find((p) => p.internalPort === 6379);
  if (port) {
    return `redis://:${valkey.Password}@${port.externalIp}:${port.externalPort}`;
  }
  throw new Error('No redis port found');
}

async function publishMessage(message: string) {
  const redisUrl = await setup();
  const redisClient = new Redis(redisUrl);
  try {
    const receivedCount = await redisClient.publish('messages', message);
    console.log(
      `Message "${message}" published to channel "messages". Received by ${receivedCount} subscribers.`
    );
  } catch (err) {
    console.error('Error publishing message', err);
  } finally {
    await redisClient.quit();
  }
}

if (!process.argv[2]) {
  console.error('Please a message to publish');
  process.exit(1);
}
publishMessage(process.argv[2]);
