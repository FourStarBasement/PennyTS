import { ClientEvents, AuditLogActions } from 'detritus-client/lib/constants';
import { GatewayClientEvents } from 'detritus-client/lib/gateway/clientevents';
import { CommandClient } from 'detritus-client/lib/commandclient';
import { ShardClient } from 'detritus-client';
import { Message, User, Reaction } from 'detritus-client/lib/structures';
import { DBServer } from '../modules/db';
import { RestClient } from 'detritus-client/lib/rest';
import { ModLogActions } from '../modules/modlog';

export const messageDelete = {
  event: ClientEvents.MESSAGE_DELETE,
  listener: async (
    client: CommandClient,
    payload: GatewayClientEvents.MessageDelete
  ) => {
    if (!payload.raw.guild_id || !payload.message) return;

    if (payload.message.author.bot) return;

    const guild = payload.message.guild!;

    if (!guild.me?.canViewAuditLogs) return;

    await client.checkGuild(payload.raw.guild_id);
    let server: DBServer = await client.queryOne(
      `SELECT mod_channel FROM servers WHERE server_id = ${guild.id}`
    );

    if (!server.mod_channel) return;

    // TODO: BigInt support
    let channel = guild.channels.get(
      server.mod_channel.toString()
    );

    if (!channel) return;

    if (
      (ModLogActions.MESSAGE_DELETE & guild.modLog) !==
      ModLogActions.MESSAGE_DELETE
    )
      return;
    setTimeout(async () => {
      let auditLog = await guild.fetchAuditLogs({
          actionType: AuditLogActions.MESSAGE_DELETE,
        })
        .then((audit) =>
          audit.find(
            (v) =>
              v.target!.id === payload.message!.author.id &&
              new Date().getTime() - v.createdAt.getTime() <= 60_0000
          )
        )
        .catch((error) => {
          console.error(`MessageDelete/${guild.id} ${error}`);
        });

      channel!.createMessage({
        embed: {
          color: 16741749,
          title: `Message sent by ${payload.message!.author.username} deleted ${
            auditLog ? `by ${auditLog.user!.username}` : ''
          } in ${payload.message!.channel?.name}`,
          thumbnail: {
            url: payload.message!.author.avatarUrl,
          },
          fields: [
            {
              name: 'Content:',
              value: payload.message!.content || 'None provided',
            },
            {
              name: 'Message ID',
              value: payload.message!.id,
            },
          ],
        },
      });
    }, 500);
  },
};
