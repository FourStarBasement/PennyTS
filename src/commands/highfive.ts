import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';

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
      let highfived = mention.id === ctx.me!.id ? 'me' : mention.username;
      let link = 'https://thumbs.gfycat.com/ElaborateAccurateFerret-small.gif';
      let img = await fetch(link).then(async (r) => await r.buffer());

      ctx.reply({
        content: `${ctx.member!.name} just high-fived ${highfived}!`,
        file: {
          filename: 'high-five.gif',
          data: img,
        },
      });
    }
  },
};
