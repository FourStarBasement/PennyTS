import { Context } from 'detritus-client/lib/command';
import { User } from 'detritus-client/lib/structures';

export const random = {
  name: 'random',
  metadata: {
    description: "Get a random user's avatar.",
    checks: ['embed'],
  },
  run: async (ctx: Context) => {
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
