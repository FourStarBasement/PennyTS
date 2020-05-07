import { ClientEvents, AuditLogActions } from 'detritus-client/lib/constants';
import { GatewayClientEvents, CommandClient } from 'detritus-client';
import { AuditLog } from 'detritus-client/lib/structures';
import { RequestTypes } from 'detritus-client-rest/lib/types';
import { PageField } from '../modules/utils';
import { DBServers } from '../modules/db';
import { ModLogActions } from '../modules/modlog';

export const guildBanRemove = {
  event: ClientEvents.GUILD_BAN_REMOVE,
  listener: async (
    client: CommandClient,
    payload: GatewayClientEvents.GuildBanRemove
  ) => {
    let guild = payload.guild!;

    client.checkGuild(payload.guildId).then(async () => {
      let results: DBServers[] = await client.query(
        `SELECT * FROM \`Servers\` WHERE \`ServerID\` = '${payload.guildId}'`
      );

      let channel = guild.channels.get(results[0].mod_channel);
      if (channel) {
        if (
          (ModLogActions.GUILD_BAN_REMOVE & guild.modLog) ===
          ModLogActions.GUILD_BAN_REMOVE
        ) {
          let auditLog = await guild
            .fetchAuditLogs({
              actionType: AuditLogActions.MEMBER_BAN_REMOVE,
            })
            .then((audit) =>
              audit.find((v, k) => v.target!.id === payload.user!.id)
            );

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
        name: `${payload.user.username}#${payload.user.discriminator} (${
          payload.user!.id
        })`,
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
