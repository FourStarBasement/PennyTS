import { CommandOptions, Context } from 'detritus-client/lib/command';

export const avatar = {
  name: 'avatar',
  metadata: {
    description: 'Displays an avatar.',
  },
  run: async (ctx: Context) => {
    let user = ctx.commandClient.fetchGuildMember(ctx) || ctx.message.author;
    if (!ctx.channel?.canEmbedLinks) {
      ctx.reply('I cannot send embeds in this chat.');
      return;
    }
    ctx.reply({
      embed: {
        title: `${user.username}'s avatar.`,
        image: {
          url: `${user.avatarUrl}?size=2048`,
        },
      },
    });
  },
};
