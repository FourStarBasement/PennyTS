import { Context } from 'detritus-client/lib/command';
import { User, UserWithFlags } from 'detritus-client/lib/structures';
import { Page } from '../../../modules/utils';
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
    let user = ctx.commandClient.fetchUser(ctx);
    if (!user && (!args.whois || isNaN(args.whois))) user = ctx.user;
    if (!user) {
      ctx.reply('I could not find that user!');
      return;
    }
    if (!user.avgColor)
      user.avgColor = await ctx.commandClient.fetchAverageColor(user.avatarUrl);

    let member = ctx.guild!.members.get(user.id);
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
          inline: true,
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

    if (member)
      embed.fields?.push({
        name: `${user.username} joined this server on`,
        value: ctx.guild!.members.get(user.id)!.joinedAt!.toDateString(),
        inline: true,
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
        inline: true,
      });
    }
    if (member) {
      if (member?.avatar && member?.avatar !== user.avatar)
        embed.fields!.push({
          name: 'Server specific icon',
          value: `[Click me!](${member?.avatarUrl}?size=2048)`,
          inline: true,
        });

      if (member.premiumSince) {
        embed.fields?.push({
          name: 'Boosting server since',
          value: member.premiumSince.toDateString(),
        });
      }

      embed.fields?.push({
        name: 'Roles',
        value: `Count: ${member.roles.length}\nHighest Role: ${member.highestRole?.name}\nColor Role: ${member.colorRole?.name}`,
        inline: true,
      });

      embed.fields?.push({
        name: 'Permissions',
        value: `${checkPerm(member.canAdministrator)} Admin\n${checkPerm(
          member.canBanMembers
        )} Ban members\n${checkPerm(
          member.canChangeNicknames
        )} Edit nicknames\n${checkPerm(
          member.canCreateInstantInvite
        )} Create Invites\n${checkPerm(
          member.canManageChannels
        )} Create/Edit Channels\n${checkPerm(
          member.canManageEmojis
        )} Create Emojis/Stickers\n${checkPerm(
          member.canManageGuild
        )} Edit Server\n${checkPerm(
          member.canManageMessages
        )} Delete Messages\n${checkPerm(
          member.canManageRoles
        )} Create/Edit Roles\n${checkPerm(
          member.canViewAuditLogs
        )} View Audit Logs\nBitwise for nerds: **${member.permissions}**`,
      });
    }
    ctx.reply({
      embed: embed,
    });
  },
};

function checkPerm(perm: boolean) {
  return perm ? '✅' : '❌';
}
