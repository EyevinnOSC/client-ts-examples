import { Context } from '@osaas/client-core';
import { createEyevinnTestAdserverInstance } from '@osaas/client-services';

async function main() {
  const ctx = new Context();

  const instance = await createEyevinnTestAdserverInstance(ctx, {
    name: 'example'
  });
  console.log(instance.url);
}

main();
