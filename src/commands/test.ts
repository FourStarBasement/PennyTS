import { CommandOptions, Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';

export const test = {
  name: 'test',
  metadata: {
    description: "It's a test command.",
  },
  run: async (context: Context) => {
    let img = await fetch(`${context.member?.avatarUrl}?size=2048`).then(
      async (r) => await r.buffer()
    );
    context
      .reply({
        content: "I'm running!",
        file: {
          filename: 'test.png',

          data: img,
        },
      })
      .catch(console.error);
  },
};
