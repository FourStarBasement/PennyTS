import { ClientEvents, AuditLogActions } from 'detritus-client/lib/constants';
import {
  GatewayClientEvents,
  CommandClient,
  ShardClient,
} from 'detritus-client';
import { DBServers } from '../modules/db';
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
      let results: DBServers[] = await client.query(
        `SELECT * FROM \`Servers\` WHERE \`ServerID\` = '${payload.guildId}'`
      );

      let channel = guild.channels.get(results[0].mod_channel);
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
              let now = new Date();
              let action = audit.find(
                (v, k) =>
                  v.targetId === payload.userId &&
                  new Date().getTime() - v.createdAt.getTime() <= 60_0000
              );
              if (!action) {
                return;
              }

              channel!.createMessage({ embed: makeEmbed(action, payload) });
            });
        }
      }

      if (results[0].Welcome === 1) {
        let channel = shardClient.channels.get(results[0].wc);
        if (channel) {
          if (results[0].LMessage) {
            let unsyntaxed = results[0].LMessage.replace(
              '{user}',
              member.username
            ).replace('{guild}', guild.name);
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
