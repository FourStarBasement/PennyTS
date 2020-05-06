import { ClientEvents, AuditLogActions } from 'detritus-client/lib/constants';
import { CommandClient, GatewayClientEvents } from 'detritus-client';
import { Servers } from '../modules/db';
import { ModLogActions } from '../modules/modlog';
import { AuditLog } from 'detritus-client/lib/structures';
import { RequestTypes } from 'detritus-client-rest/lib/types';

export const guildMemberAdd = {
  event: ClientEvents.GUILD_MEMBER_ADD,
  listener: async (
    client: CommandClient,
    payload: GatewayClientEvents.GuildMemberAdd
  ) => {
    let member = payload.member;
    let guild = payload.member.guild!;

    await client.checkGuild(payload.guildId).then(async () => {
      let results: Servers[] = await client.query(
        `SELECT * FROM \`Servers\` WHERE \`ServerID\` = '${payload.guildId}'`
      );

      let channel = guild.channels.get(results[0].mod_channel);
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
                channel!.createMessage(
                  makeEmbed(
                    audit.find((v, k) => v.targetId === payload.userId)!,
                    payload
                  )
                );
              });
          }
        }
      }

      if (results[0].Welcome === 1) {
        const channel = guild.channels.get(results[0].wc);

        if (channel) {
          if (results[0].WMessage) {
            let unsyntaxed = results[0].WMessage.replace(
              '{user}',
              member.username
            ).replace('{guild}', guild.name);
            channel.createMessage(unsyntaxed);
          } else {
            channel.createMessage(
              `**${member.username}** just joined **${guild.name}**`
            );
          }
        }

        const role = guild.roles.get(results[0].WRole);

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
): RequestTypes.CreateMessage {
  return {
    embed: {
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
    },
  };
}
