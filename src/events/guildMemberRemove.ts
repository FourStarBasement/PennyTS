import { ClientEvents, AuditLogActions } from 'detritus-client/lib/constants';
import {
  GatewayClientEvents,
  CommandClient,
  ShardClient,
} from 'detritus-client';
import { DBServer } from '../modules/db';
import { ModLogActions } from '../modules/modlog';
import { AuditLog } from 'detritus-client/lib/structures';
import { RequestTypes } from 'detritus-client-rest/lib/types';
import { Page } from '../modules/utils';

export const guildMemberRemove = {
  event: ClientEvents.GUILD_MEMBER_REMOVE,
  listener: async (
    client: CommandClient,
    payload: GatewayClientEvents.GuildMemberRemove
  ) => {
    let shardClient = client.client as ShardClient;

    let member = payload.user;
    let guild = shardClient.guilds.get(payload.guildId)!;

    client.checkGuild(payload.guildId).then(async () => {
      let server: DBServer = await client.queryOne(
        `SELECT mod_channel, welcome, welcome_channel, leave_message  FROM servers WHERE server_id = ${payload.guildId}`
      );

      if (!server.mod_channel) return;

      let channel = guild.channels.get(server.mod_channel.toString());
      if (channel) {
        if (
          (ModLogActions.GUILD_MEMBER_REMOVE & guild.modLog) ===
          ModLogActions.GUILD_MEMBER_REMOVE
        ) {
          guild
            .fetchAuditLogs({
              actionType: AuditLogActions.MEMBER_KICK,
            })
            .then((audit) => {
              let action = audit.find(
                (v, _) =>
                  v.targetId === payload.userId &&
                  new Date().getTime() - v.createdAt.getTime() <= 60_0000
              );
              if (!action) {
                return;
              }

              channel!.createMessage({ embed: makeEmbed(action, payload) });
            })
            .catch((error) => {
              console.error(`GuildMemberRemove/${payload.guildId} ${error}`);
            });
        }
      }

      if (server.welcome) {
        let channel = shardClient.channels.get(
          server.welcome_channel.toString()
        );
        if (channel) {
          if (server.leave_message) {
            let unsyntaxed = server.leave_message
              .replace('{user}', member.username)
              .replace('{guild}', guild.name);
            channel.createMessage(unsyntaxed);
          } else {
            channel.createMessage(
              `**${member.username}** just left **${guild.name}**`
            );
          }
        }
      }
    });
  },
};

function makeEmbed(
  audit: AuditLog,
  payload: GatewayClientEvents.GuildMemberRemove
): Page {
  return {
    author: {
      iconUrl: payload.user.avatarUrl,
      name: `${payload.user.username}#${payload.user.discriminator} (${payload.userId})`,
    },
    color: 13369344,
    title: 'Member Kicked',
    fields: [
      {
        name: 'Kicked by',
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
  };
}
