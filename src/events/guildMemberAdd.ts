import { ClientEvents, AuditLogActions } from 'detritus-client/lib/constants';
import { CommandClient, GatewayClientEvents } from 'detritus-client';
import { DBServer } from '../modules/db';
import { ModLogActions } from '../modules/modlog';
import { AuditLog } from 'detritus-client/lib/structures';
import { RequestTypes } from 'detritus-client-rest/lib/types';
import { Page } from '../modules/utils';

export const guildMemberAdd = {
  event: ClientEvents.GUILD_MEMBER_ADD,
  listener: async (
    client: CommandClient,
    payload: GatewayClientEvents.GuildMemberAdd
  ) => {
    let member = payload.member;
    let guild = payload.member.guild!;

    await client.checkGuild(payload.guildId).then(async () => {
      let server: DBServer = await client.query(
        `SELECT mod_channel FROM servers WHERE server_id = ${payload.guildId}`
      );

      if (!server.mod_channel) return;

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
                    audit.find((v, k) => v.targetId === payload.userId)!,
                    payload
                  ),
                });
              });
          }
        }
      }

      if (server.welcome === 1) {
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

        const role = guild.roles.get(server.welcome_role.toString());

        if (role) {
          await member.addRole(role.id);
        }
      }
    });
  },
};

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
