import { ClientEvents, AuditLogActions } from 'detritus-client/lib/constants';
import { GatewayClientEvents } from 'detritus-client/lib/gateway/clientevents';
import { CommandClient } from 'detritus-client/lib/commandclient';
import { ShardClient } from 'detritus-client';
import { Message, User, Reaction } from 'detritus-client/lib/structures';
import { DBServers } from '../modules/db';
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

    await client.checkGuild(payload.raw.guild_id);
    let results: DBServers[] = await client.query(
      `SELECT * FROM \`Servers\` WHERE \`ServerID\` = '${payload.raw.guild_id}'`
    );
    let channel = payload.message.guild!.channels.get(results[0].mod_channel);

    if (!channel) return;

    if (
      (ModLogActions.MESSAGE_DELETE & payload.message.guild!.modLog) !==
      ModLogActions.MESSAGE_DELETE
    )
      return;
    setTimeout(async () => {
      let auditLog = await payload
        .message!.guild!.fetchAuditLogs({
          actionType: AuditLogActions.MESSAGE_DELETE,
        })
        .then((audit) =>
          audit.find(
            (v) =>
              v.target!.id === payload.message!.author.id &&
              new Date().getTime() - v.createdAt.getTime() <= 60_0000
          )
        );
      let user: string;

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
