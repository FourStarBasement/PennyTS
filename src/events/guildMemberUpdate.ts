import { ClientEvents, AuditLogActions } from 'detritus-client/lib/constants';
import { GatewayClientEvents, CommandClient } from 'detritus-client';
import { AuditLog } from 'detritus-client/lib/structures';
import { RequestTypes } from 'detritus-client-rest/lib/types';
import { PageField, escapeMarkdown } from '../modules/utils';
import { DBServer } from '../modules/db';
import { ModLogActions } from '../modules/modlog';

export const guildMemberUpdate = {
  event: ClientEvents.GUILD_MEMBER_UPDATE,
  listener: async (
    client: CommandClient,
    payload: GatewayClientEvents.GuildMemberUpdate
  ) => {
    let guild = payload.member.guild!;

    client.checkGuild(payload.guildId).then(async () => {
      let server: DBServer = await client.queryOne(
        `SELECT mod_channel FROM servers WHERE server_id = ${payload.guildId}`
      );

      let channel = guild.channels.get(server.mod_channel.toString());
      if (channel) {
        if (
          (ModLogActions.GUILD_MEMBER_UPDATE & guild.modLog) ===
          ModLogActions.GUILD_MEMBER_UPDATE
        ) {
          let auditLog = await guild
            .fetchAuditLogs({
              limit: 50,
              actionType: payload.differences.nick
                ? AuditLogActions.MEMBER_UPDATE
                : AuditLogActions.MEMBER_ROLE_UPDATE,
            })
            .then((audit) =>
              audit.find(
                (v, k) =>
                  v.targetId === payload.userId &&
                  v.userId !== payload.userId &&
                  new Date().getTime() - v.createdAt.getTime() <= 60_0000
              )
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
  payload: GatewayClientEvents.GuildMemberUpdate
): RequestTypes.CreateMessage {
  let field: PageField;
  let change = audit.changes.first();

  if (audit.actionType === AuditLogActions.MEMBER_ROLE_UPDATE) {
    field = {
      name: `Role ${change.key === '$add' ? 'Added' : 'Removed'}`,
      value: `<@&${change.newValue[0].id}>`,
    };
  } else {
    field = {
      name: 'Nickname Changed',
      value: `Old: ${escapeMarkdown(change.oldValue)}\nNew: ${escapeMarkdown(
        change.newValue
      )}`,
    };
  }

  return {
    embed: {
      author: {
        iconUrl: payload.member.avatarUrl,
        name: `${payload.member.username}#${payload.member.discriminator} (${payload.userId})`,
      },
      color: 13369344,
      title: 'Member Updated',
      fields: [
        field,
        {
          name: 'Updated by',
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
