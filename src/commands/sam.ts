import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import images from '../modules/images';

export const sam = {
  name: 'sam',
  metadata: {
    description: 'sam',
  },
  run: async (ctx: Context) => {
    if (!ctx.channel?.canAttachFiles) {
      ctx.reply("I don't have permissions to send images in this chat.");
      return;
    }

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
