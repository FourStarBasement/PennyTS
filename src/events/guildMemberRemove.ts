import { ClientEvents } from 'detritus-client/lib/constants';
import {
  GatewayClientEvents,
  CommandClient,
  ShardClient,
} from 'detritus-client';
import { Servers } from '../modules/db';

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
      let results: Servers[] = await client.query(
        `SELECT * FROM \`Servers\` WHERE \`ServerID\` = '${payload.guildId}'`
      );

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
