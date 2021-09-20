import { Context } from 'detritus-client/lib/command';
import { Member } from 'detritus-client/lib/structures';
import { PresenceStatuses } from 'detritus-client/lib/constants';

export const serverinfo = {
  name: 'serverinfo',
  metadata: {
    description: 'Server information',
    checks: ['embeds'],
  },
  run: async (ctx: Context) => {
    let total = ctx.guild!.members.filter((m: Member) => !m.bot).length;
    let online = ctx.guild!.members.filter(
      (m: Member) => !m.bot && m.presence?.status === PresenceStatuses.ONLINE
    ).length;
    let dnd = ctx.guild!.members.filter(
      (m: Member) => !m.bot && m.presence?.status === PresenceStatuses.DND
    ).length;
    let idle = ctx.guild!.members.filter(
      (m: Member) => !m.bot && m.presence?.status === PresenceStatuses.IDLE
    ).length;
    let offline = ctx.guild!.members.filter(
      (m: Member) => !m.bot && m.presence?.status === undefined
    ).length;
    let bots = ctx.guild!.members.filter((m: Member) => m.bot).length;

    if (!ctx.guild?.avgColor)
      ctx.guild!.avgColor = await ctx.commandClient.fetchAverageColor(
        ctx.guild!.iconUrl!
      );
    let embed = {
      title: ctx.guild?.name,
      fields: [
        {
          name: 'Guild ID',
          value: ctx.guildId!,
        },
        {
          name: 'Members',
          value: `Total: ${total}
          <:online:499784465145397258> ${online}
                <:dnd:499778040147083264> ${dnd}
                <:idle:499784448334888960> ${idle}
                <:invisible:499784436276133889> ${offline}
                <:bot:499786409348038686> ${bots}`,
        },
        {
          name: 'Owner',
          value: `${ctx.guild?.members.get(ctx.guild?.ownerId)} | ${
            ctx.guild?.ownerId
          }`,
        },
        {
          name: 'Server created',
          value: ctx.guild!.createdAt.toString(),
        },
      ],
      thumbnail: {
        url: ctx.guild?.iconUrl!,
      },
      color: ctx.guild?.avgColor,
    };
    ctx.reply({
      embed: embed,
    });
  },
};
