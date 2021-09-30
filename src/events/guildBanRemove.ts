import { ClientEvents, AuditLogActions } from 'detritus-client/lib/constants';
import { GatewayClientEvents, CommandClient } from 'detritus-client';
import { AuditLog } from 'detritus-client/lib/structures';
import { RequestTypes } from 'detritus-client-rest/lib/types';
import { ModLogActionFlags, DBServer } from '../modules/db';

export const guildBanRemove = {
  event: ClientEvents.GUILD_BAN_REMOVE,
  listener: async (
    client: CommandClient,
    payload: GatewayClientEvents.GuildBanRemove
  ) => {
    let guild = payload.guild!;

    if (!guild.me?.canViewAuditLogs) return;

    client.checkGuild(payload.guildId).then(async () => {
      let server: DBServer = await client.queryOne(
        `SELECT mod_channel FROM servers WHERE server_id = ${payload.guildId}`
      );

      if (!server.mod_channel) return;

      let channel = guild.channels.get(server.mod_channel.toString());
      if (channel) {
        if (
          (ModLogActionFlags.GUILD_BAN_REMOVE & guild.modLog) ===
          ModLogActionFlags.GUILD_BAN_REMOVE
        ) {
          let auditLog = await guild
            .fetchAuditLogs({
              actionType: AuditLogActions.MEMBER_BAN_REMOVE,
            })
            .then((audit) =>
              audit.find(
                (v, _) =>
                  v.target!.id === payload.user.id &&
                  new Date().getTime() - v.createdAt.getTime() <= 60_0000
              )
            )
            .catch((error) => {
              console.error(`GuildBanRemove/${payload.guildId} ${error}`);
            });

          if (!auditLog) {
            return; // Must be self-update
          }

          channel.createMessage(makeEmbed(auditLog, payload));
        }
      }
    });
  },
};

function makeEmbed(
  audit: AuditLog,
  payload: GatewayClientEvents.GuildBanAdd
): RequestTypes.CreateMessage {
  return {
    embed: {
      author: {
        iconUrl: payload.user.avatarUrl,
        name: `${payload.user.username}#${payload.user.discriminator} (${payload.user.id})`,
      },
      color: 13369344,
      title: 'Member Unbanned',
      fields: [
        {
          name: 'Member Unbanned',
          value: `${audit.target!.name}#${audit.target!.discriminator} (${
            audit.targetId
          })`,
        },
        {
          name: 'Unbanned by',
          value: `${audit.user!.username}#${audit.user!.discriminator} (${
            audit.userId
          })`,
        },
        {
          name: 'Reason',
          value: audit.reason ? audit.reason : 'None Given',
        },
      ],
      timestamp: new Date().toISOString(),
    },
  };
}
