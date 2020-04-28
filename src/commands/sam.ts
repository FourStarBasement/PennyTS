import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import images from '../modules/images';

export const sam = {
  name: 'sam',
  metadata: {
    description: 'sam',
    checks: ['attachments'],
  },
  run: async (ctx: Context) => {
    let toSam = images.sam[Math.floor(Math.random() * images.sam.length)];

    let split = toSam.split('.');
    let ext = split[split.length - 1];

    let img = await fetch(toSam).then(async (r) => r.buffer());
    ctx.reply({
      file: {
        filename: `sam.${ext}`,
        data: img,
      },
    });
  },
};
