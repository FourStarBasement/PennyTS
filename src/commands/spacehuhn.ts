import { Context } from 'detritus-client/lib/command';

export const spacehuhn = {
  name: 'spacehuhn',
  metadata: {
    description: '<3',
    checks: ['embeds'],
  },
  aliases: ['chicken', 'stef'],
  run: async (ctx: Context) => {
    let hi = Math.floor(Math.random() * 42);
    let embed = {
      title: "Here's your official Spacehuhn meme:tm:",
      image: { url: `https://spacehuhn.io/img/gallery/${hi}.jpg` },
      color: 45311,
    };
    ctx.reply({
      embed: embed,
    });
  },
};
