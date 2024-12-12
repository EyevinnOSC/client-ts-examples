// An example application that uses the application configuration
// open web service for managing application configuration.

import { Context, getInstance, getPortsForInstance } from '@osaas/client-core';
import {
  EyevinnAppConfigSvc,
  createEyevinnAppConfigSvcInstance,
  createValkeyIoValkeyInstance
} from '@osaas/client-services';

async function getRedisUrlFromValkeyInstance(ctx: Context, name: string) {
  const SERVICE_ID = 'valkey-io-valkey';
  const serviceAccessToken = await ctx.getServiceAccessToken(SERVICE_ID);
  const ports = await getPortsForInstance(
    ctx,
    'valkey-io-valkey',
    'configstore',
    serviceAccessToken
  );
  const redisPort = ports.find((port) => port.internalPort == 6379);
  if (!redisPort) {
    throw new Error(`Failed to get redis port for instance ${name}`);
  }
  return `redis://${redisPort.externalIp}:${redisPort.externalPort}`;
}

async function setup(ctx: Context) {
  const configServiceAccessToken = await ctx.getServiceAccessToken(
    'eyevinn-app-config-svc'
  );
  let configService: EyevinnAppConfigSvc = await getInstance(
    ctx,
    'eyevinn-app-config-svc',
    'example',
    configServiceAccessToken
  );
  if (!configService) {
    const valkeyInstance = await createValkeyIoValkeyInstance(ctx, {
      name: 'configstore'
    });
    const redisUrl = await getRedisUrlFromValkeyInstance(
      ctx,
      valkeyInstance.name
    );
    configService = await createEyevinnAppConfigSvcInstance(ctx, {
      name: 'example',
      RedisUrl: redisUrl
    });
  }
  return configService;
}

async function saveConfigVariable(service: EyevinnAppConfigSvc, key: string, value: string) {
  const url = new URL('/api/v1/config', service.url);
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ key, value })
  });
  if (!response.ok) {
    throw new Error(`Failed to save config: ${response.statusText}`);
  }
}

async function readConfigVariable(service: EyevinnAppConfigSvc, key: string) {
  const url = new URL(`/api/v1/config/${key}`, service.url);
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    return undefined;
  }
  const data = await response.json();
  return data.value;
}

async function main() {
  const ctx = new Context();
  const service = await setup(ctx);
  console.log('Configuration UI available at:', service.url);
  let value = await readConfigVariable(service, 'foo');
  if (!value) {
    await saveConfigVariable(service, 'foo', 'default');
    value = await readConfigVariable(service, 'foo');
  }
  console.log(`Config value: ${value}`);
}

main();
