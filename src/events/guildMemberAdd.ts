import { ClientEvents, AuditLogActions } from 'detritus-client/lib/constants';
import { CommandClient, GatewayClientEvents } from 'detritus-client';
import { DBServer } from '../modules/db';
import { ModLogActions } from '../modules/modlog';
import { AuditLog, Guild, Member } from 'detritus-client/lib/structures';
import { Page, GuildFlags } from '../modules/utils';

export const guildMemberAdd = {
  event: ClientEvents.GUILD_MEMBER_ADD,
  listener: async (
    client: CommandClient,
    payload: GatewayClientEvents.GuildMemberAdd
  ) => {
    let member = payload.member;
    let guild = payload.member.guild!;

    await client.checkGuild(payload.guildId)

    let server: DBServer = await client.queryOne(
      `SELECT mod_channel, flags, welcome_message, welcome_channel, welcome_role FROM servers WHERE server_id = ${payload.guildId}`
    );

    await Promise.all([
      maybeModLog(payload, member, guild, server),
      maybeWelcome(client, member, guild, server)
    ])
  },
};

async function maybeModLog(payload: GatewayClientEvents.GuildMemberAdd, member: Member, guild: Guild, server: DBServer) {
  if (!server.mod_channel) return;
  if (!guild.me?.canViewAuditLogs) return;

  let channel = guild.channels.get(server.mod_channel.toString());
  if (channel) {
    if (
      (ModLogActions.GUILD_MEMBER_ADD & guild.modLog) ===
      ModLogActions.GUILD_MEMBER_ADD
    ) {
      if (member.bot) {
        guild
          .fetchAuditLogs({
            actionType: AuditLogActions.BOT_ADD,
          })
          .then((audit) => {
            channel!.createMessage({
              embed: makeEmbed(
                audit.find((v, _) => v.targetId === payload.userId)!,
                payload
              ),
            });
          })
          .catch((error) => {
            console.error(`GuildMemberAdd/${payload.guildId} ${error}`);
          });
      }
    }
  }
}

async function maybeWelcome(client: CommandClient, member: Member, guild: Guild, server: DBServer) {
  if (!client.hasFlag(server.flags, GuildFlags.WELCOMES)) return;
  if (server.welcome_role) {
  const role = guild.roles.get(server.welcome_role.toString());
  if (role) {
    await member.addRole(role.id);
  }
}
  const channel = guild.channels.get(server.welcome_channel.toString());

  if (channel) {
    if (server.welcome_message) {
      let unsyntaxed = server.welcome_message
        .replace('{user}', member.username)
        .replace('{guild}', guild.name);
      channel.createMessage(unsyntaxed);
    } else {
      channel.createMessage(
        `**${member.username}** just joined **${guild.name}**`
      );
    }
  }
}

function makeEmbed(
  audit: AuditLog,
  payload: GatewayClientEvents.GuildMemberAdd
): Page {
  return {
    author: {
      iconUrl: payload.member.avatarUrl,
      name: `${payload.member.username}#${payload.member.discriminator} (${payload.userId})`,
    },
    color: 39219,
    title: 'Bot Added',
    fields: [
      {
        name: 'Added by',
        value: `${audit.user!.username}#${audit.user!.discriminator} (${
          audit.userId
        })`,
      },
    ],
    timestamp: new Date().toISOString(),
  };
}
