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
    console.log(ctx.member);
    if (!user.avgColor)
      user.avgColor = await ctx.commandClient.fetchAverageColor(user.avatarUrl);
    let embed = {
      title: `${user.username}'s avatar.`,
      image: {
        url: `${user.avatarUrl}?size=2048`,
      },
      color: 6969,
    };
    if (ctx.member && ctx.member.avatar !== user.avatar)
      embed.image = { url: `${ctx.member.avatarUrl}?size=2048` };

    ctx.reply({
      embed: embed,
    });
  },
};
