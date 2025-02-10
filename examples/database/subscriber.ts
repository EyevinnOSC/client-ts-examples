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

async function main() {
  const redisUrl = await setup();
  const client = new Redis(redisUrl);
  try {
    await client.subscribe('messages');
    console.log('Waiting for messages...');
    client.on('message', (channel, message) => {
      console.log(`Received message: ${message} from ${channel}`);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
