import { Context } from 'detritus-client/lib/command';

export const spacehuhn = {
  name: 'spacehuhn',
  metadata: {
    description: '<3',
  },
  aliases: ['chicken', 'stef'],
  run: async (ctx: Context) => {
    if (!ctx.channel?.canEmbedLinks) {
      ctx.reply('I cannot send embeds in this chat.');
      return;
    }
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
