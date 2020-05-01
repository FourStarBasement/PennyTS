import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';

export const inspire = {
  name: 'inspire',
  metadata: {
    description: 'Posts an "inspirational" image.',
    checks: ['attachments'],
  },
  run: async (ctx: Context) => {
    let img = await fetch(`http://inspirobot.me/api?generate=true`);
    let imgText = await img.text();
    let buffer = await (await fetch(imgText)).buffer();
    ctx.reply({
      file: {
        filename: 'inspire.png',
        data: buffer,
      },
    });
  },
};
