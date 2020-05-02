import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import images from '../../modules/images';

const canKissWiggy = ['407773762814083072'];

export const kiss = {
  name: 'kiss',
  metadata: {
    description: 'Kisses a user',
    checks: ['attachments'],
  },
  run: async (ctx: Context) => {
    let author = ctx.member!;
    let mention = ctx.message.mentions.first();

    if (!mention) {
      ctx.reply('Please mention a valid user.');
    } else if (mention.id === author.id) {
      ctx.reply('You cannot kiss yourself, Creep...');
    } else if (
      mention.id === '232614905533038593' &&
      !canKissWiggy.includes(author.id)
    ) {
      let link = 'https://media2.giphy.com/media/xT9IgAWzvvcohEMofu/source.gif';
      let img = await fetch(link).then(async (r) => await r.buffer());

      ctx.reply({
        content: `${author.username} just tried to kiss Lilwiggy. Yeah that didn't work.`,
        file: {
          filename: 'ew.gif',
          data: img,
        },
      });
    } else {
      let kissed = mention.id === ctx.me!.id ? 'me' : mention.username;
      let kiss = images.kiss[Math.floor(Math.random() * images.kiss.length)];

      let img = await fetch(kiss).then(async (r) => await r.buffer());

      ctx.reply({
        content: `${author.username} just gave ${kissed} a kiss!`,
        file: {
          filename: `kiss.gif`,
          data: img,
        },
      });
    }
  },
};
