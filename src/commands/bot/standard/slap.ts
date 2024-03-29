import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import images from '../../../modules/images';

export const slap = {
  name: 'slap',
  metadata: {
    description: 'Slap someone.',
    checks: ['attachments'],
  },
  run: async (ctx: Context) => {
    let slap = images.slap[Math.floor(Math.random() * images.slap.length)];

    let mention = ctx.message.mentions.first();
    let username = ctx.member!.username;

    let content = `${username} just slapped ${mention?.username}!`;

    if (!mention || mention.id === ctx.member!.id) {
      content = `${username} has just slapped themselves in confusion.`;
    } else if (mention.id === '232614905533038593') {
      content = `${username} just tried to slap my creator, Lilwiggy, but instead themselves in confusion.`;
    } else if (mention.id === ctx.me!.id) {
      content = `${username} just tried to slap me. But they missed and I slapped them back.`;
    }

    let img = await fetch(slap).then(async (r) => await r.buffer());

    ctx.reply({
      content: content,
      file: {
        filename: 'slap.gif',
        value: img,
      },
    });
  },
};
