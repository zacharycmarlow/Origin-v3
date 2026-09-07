import { BskyAgent } from '@atproto/api';

/* ═══════════════════════════════════════════════════════════════
   Bluesky sharing — post text and images to Bluesky/AT Protocol.

   Uses the official @atproto/api SDK (MIT + Apache-2.0).
   The user provides their handle and an app password.
   ═══════════════════════════════════════════════════════════════ */

export async function postToBluesky(
  text: string,
  imageBlob?: Blob,
  credentials?: { identifier: string; password: string },
): Promise<{ uri: string }> {
  if (!credentials) throw new Error('Bluesky credentials required');

  const agent = new BskyAgent({ service: 'https://bsky.social' });
  await agent.login(credentials);

  if (imageBlob) {
    const uint8 = new Uint8Array(await imageBlob.arrayBuffer());
    const uploadRes = await agent.uploadBlob(uint8, { encoding: imageBlob.type || 'image/png' });
    return agent.post({
      text,
      embed: {
        $type: 'app.bsky.embed.images',
        images: [{ image: uploadRes.data.blob, alt: text.slice(0, 100) }],
      },
    });
  }

  return agent.post({ text });
}
