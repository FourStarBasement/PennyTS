import { Context } from 'detritus-client/lib/command';
import { User, UserWithFlags } from 'detritus-client/lib/structures';
import { Page } from '../../modules/utils';
import { UserFlags } from 'detritus-client/lib/constants';
import { Emoji } from 'detritus-client/lib/structures';

interface CommandArgs {
  whois: number;
}

export const whoIs = {
  name: 'whois',
  metadata: {
    description: 'Find out basic info on a user.',
  },
  arg: {
    name: 'whois',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    let user = ctx.commandClient.fetchGuildMember(ctx) as User;
    if (!user)
      if (isNaN(args.whois)) user = ctx.user;
      else user = await ctx.client.rest.fetchUser(args.whois.toString());
    if (!user.avgColor)
      user.avgColor = await ctx.commandClient.fetchAverageColor(user.avatarUrl);
    let embed: Page = {
      title: `${user} (${user.id})`,
      color: user.avgColor,
      thumbnail: {
        url: user.avatarUrl,
      },
      fields: [
        {
          name: 'Account created on',
          value: user.createdAt.toDateString(),
        },
      ],
    };

    if (ctx.guild?.members.get(user.id))
      embed.fields?.push({
        name: `${user.username} joined this server on`,
        value: ctx.guild!.members.get(user.id)!.joinedAt!.toDateString(),
      });
    let flags = [];
    for (let i: number = 0; i < 18; i++) {
      if (user.hasPublicFlag(1 << i))
        flags.push(
          ctx.client.emojis.find((e: Emoji) => e.name === UserFlags[1 << i])
        );
    }
    if (flags.length > 0) {
      embed.fields?.push({
        name: 'Public badges',
        value: flags.join(' '),
      });
    }
    ctx.reply({
      embed: embed,
    });
  },
};
