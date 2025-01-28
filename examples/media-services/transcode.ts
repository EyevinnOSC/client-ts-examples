// Transcode a video file to a different format using SVT Encore

import { Context } from '@osaas/client-core';
import { getEncoreInstance } from '@osaas/client-services';

async function transcode(
  encoreInstanceName: string,
  profile: string,
  outputId: string,
  inputUrl: URL
) {
  const ctx = new Context();
  const token = await ctx.getServiceAccessToken('encore');

  const encore = await getEncoreInstance(ctx, encoreInstanceName);
  if (!encore) {
    throw new Error(`Encore instance ${encoreInstanceName} not found`);
  }
  const response = await fetch(new URL('/encoreJobs', encore.url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      externalId: outputId,
      profile,
      outputFolder: 's3://output/tutorial',
      baseName: outputId,
      inputs: [
        {
          type: 'AudioVideo',
          copyTs: true,
          uri: inputUrl.toString()
        }
      ]
    })
  });
  if (!response.ok) {
    throw new Error(`Failed to create Encore job: ${response.statusText}`);
  }
  const job = await response.json();
  console.log(job);
}

transcode('tutorial', 'program', 'myfile', new URL('s3://input/VINN.mp4'));
