import { Context } from '@osaas/client-core';
import {
  createEyevinnAiCodeReviewerInstance,
  getEyevinnAiCodeReviewerInstance
} from '@osaas/client-services';

async function reviewCode(gitHubUrl: URL) {
  const ctx = new Context();
  let reviewer = await getEyevinnAiCodeReviewerInstance(ctx, 'example');
  if (!reviewer) {
    reviewer = await createEyevinnAiCodeReviewerInstance(ctx, {
      name: 'example',
      OpenAiApiKey: '{{secrets.openaikey}}'
    });
  }
  const reviewRequestUrl = new URL('/api/v1/review', reviewer.url);
  const sat = await ctx.getServiceAccessToken('eyevinn-ai-code-reviewer');
  const response = await fetch(reviewRequestUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sat}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      githubUrl: gitHubUrl.toString()
    })
  });
  if (response.ok) {
    const review = await response.json();
    return review;
  } else {
    throw new Error('Failed to get review');
  }
}

async function main() {
  const review = await reviewCode(
    new URL('https://github.com/EyevinnOSC/client-ts-examples')
  );
  console.log(`Overall score: ${review.review.scoring_criteria.overall_score}`);
}

main();
