// Generate a service access token for test-adserver service

import { Context } from '@osaas/client-core';

async function main() {
  const ctx = new Context();
  const token = await ctx.getServiceAccessToken('eyevinn-test-adserver');
  console.log(token);
}

main();
