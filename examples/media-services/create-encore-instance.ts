import { Context } from '@osaas/client-core';
import { createEncoreInstance } from '@osaas/client-services';

async function main() {
  const ctx = new Context();
  const instance = await createEncoreInstance(ctx, {
    name: 'example'
  });
  console.log(instance);
}

main();
