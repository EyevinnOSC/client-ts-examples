import { Context } from '@osaas/client-core';
import { createVod, createVodPipeline } from '@osaas/client-transcode';

async function main() {
  const ctx = new Context();
  const pipeline = await createVodPipeline('sdkexample', ctx);
  const vod = await createVod(
    pipeline,
    'https://testcontent.eyevinn.technology/mp4/VINN.mp4',
    ctx
  );
  console.log(vod);
}

main();
