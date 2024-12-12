import { Context } from '@osaas/client-core';
import { removeVodPipeline } from '@osaas/client-transcode';

async function main() {
  const ctx = new Context();
  await removeVodPipeline('sdkexample', ctx);
}

main();
