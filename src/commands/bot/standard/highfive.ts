import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import images from '../../../modules/images';

export const highfive = {
  name: 'highfive',
  metadata: {
    description: 'Give someone a high-five.',
    checks: ['attachments'],
  },
  run: async (ctx: Context) => {
    let mention = ctx.message.mentions.first();

    if (!mention) {
      ctx.reply('Please mention a valid user.');
    } else if (mention.id === ctx.member!.id) {
      ctx.reply("You can't high-five yourself. (That's sad)");
    } else {
      ctx.channel?.triggerTyping();
      let highfived = mention.id === ctx.me!.id ? 'me' : mention.username;
      let link =
        images.highfives[Math.floor(Math.random() * images.highfives.length)];
      let img = await fetch(link).then(async (r) => await r.buffer());

      await ctx.reply({
        content: `${ctx.member!.name} just high-fived ${highfived}!`,
        file: {
          filename: 'high-five.gif',
          value: img,
        },
      });
    }
  },
};
