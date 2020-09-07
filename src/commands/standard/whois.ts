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
      else
        user = (await ctx.client.rest
          .fetchUser(args.whois.toString())
          .catch((err) => {
            console.log(err);
            return;
          })) as User;
    if (!user) {
      ctx.reply('I could not find that user!');
      return;
    }
    if (!user.avgColor)
      user.avgColor = await ctx.commandClient.fetchAverageColor(user.avatarUrl);
    let embed: Page = {
      title: `${user.username} (${user.id})\n`,
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
    // This adds the status to the title of the embed. It's a little long...
    let e_name: string = '';
    if (!user.presence?.status) e_name = 'invisible';
    else e_name = user.presence?.status.toLowerCase();
    embed.title += `${ctx.client.emojis.find(
      (e: Emoji) => e.name === e_name
    )} (${e_name === 'invisible' ? 'offline' : e_name})`;

    if (ctx.guild?.members.get(user.id))
      embed.fields?.push({
        name: `${user.username} joined this server on`,
        value: ctx.guild!.members.get(user.id)!.joinedAt!.toDateString(),
      });
    let status: string | undefined;
    if (user.presence) {
      switch (user.presence.activities.first()?.name) {
        case 'Custom Status':
          status = user.presence.activities.first()!.state!;
          break;
        case 'Spotify':
          status = `${user.presence.activities.first()!
            .state!} on spotify.\nRun ${ctx.prefix}listening ${
            args.whois || ''
          } to learn more!`;
          break;
      }
      embed.fields?.push({
        name: user.presence?.activities.first()?.typeText || 'Status',
        value:
          status ||
          user.presence?.activities.first()?.name ||
          'Not playing anything',
      });
    }
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
