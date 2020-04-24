import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import stuff from '../modules/sam';

export const sam = {
  name: 'sam',
  run: async (ctx: Context) => {
    if (!ctx.channel?.canAttachFiles) {
      ctx.reply("I don't have permissions to send images in this chat.");
      return;
    }

    let toSam = stuff.things[Math.floor(Math.random() * stuff.things.length)];

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
