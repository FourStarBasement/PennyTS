import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import stuff from '../modules/slap';

export const slap = {
  name: 'slap',
  run: async (ctx: Context) => {
    if (!ctx.channel?.canAttachFiles) {
      ctx.reply("I don't have permissions to send images in this chat.");
      return;
    }

    let slap = stuff.things[Math.floor(Math.random() * stuff.things.length)];

    let mention = ctx.message.mentions.first();
    let username = ctx.message.author.username;

    let content;

    if (!mention || mention.id == ctx.message.author.id) {
      content = `${username} has just slapped themselves in confusion.`;
    } else if (mention.id == '232614905533038593') {
      content = `${username} just tried to slap my creator, Lilwiggy, but instead themselves in confusion.`;
    } else if (mention.id == ctx.me!.id) {
      content = `${username} just tried to slap me. But they missed and I slapped them back.`;
    }

    let img = await fetch(slap).then(async (r) => await r.buffer());

    ctx.reply({
      content: content,
      file: {
        filename: 'slap.gif',
        data: img,
      },
    });
  },
};
