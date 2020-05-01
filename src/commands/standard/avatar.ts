import { Context } from 'detritus-client/lib/command';

export const avatar = {
  name: 'avatar',
  metadata: {
    description: 'Displays an avatar.',
    checks: ['embed'],
  },
  run: async (ctx: Context) => {
    let user = ctx.commandClient.fetchGuildMember(ctx) || ctx.message.author;
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
