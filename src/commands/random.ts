import { Context } from 'detritus-client/lib/command';
import { User } from 'detritus-client/lib/structures';

export const random = {
  name: 'random',
  run: async (ctx: Context) => {
    if (!ctx.channel?.canEmbedLinks) {
      ctx.reply('I cannot send embeds in this chat.');
      return;
    }
    let users: Array<User> = ctx.client.users.toArray();
    let user: User = users[Math.floor(Math.random() * users.length)];
    console.log(ctx.member?.color);
    ctx.reply({
      embed: {
        title: `Random avatar from ${user.username}`,
        image: { url: `${user.avatarUrl}?size=2048` },
        color: ctx.member?.color,
      },
    });
  },
};
