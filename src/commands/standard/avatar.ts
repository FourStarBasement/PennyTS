import { Context } from 'detritus-client/lib/command';
import { User } from 'detritus-client/lib/structures';

export const avatar = {
  name: 'avatar',
  metadata: {
    description: 'Displays an avatar.',
    checks: ['embed'],
  },
  run: async (ctx: Context) => {
    let user =
      (ctx.commandClient.fetchGuildMember(ctx) as User) || ctx.message.author;

    if (!user.avgColor)
      user.avgColor = await ctx.commandClient.fetchAverageColor(user.avatarUrl);
    ctx.reply({
      embed: {
        title: `${user.username}'s avatar.`,
        image: {
          url: `${user.avatarUrl}?size=2048`,
        },
        color: user.avgColor,
      },
    });
  },
};
