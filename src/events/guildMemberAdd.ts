import { ClientEvents } from 'detritus-client/lib/constants';
import { CommandClient, GatewayClientEvents } from 'detritus-client';

export const guildMemberAdd = {
  event: ClientEvents.GUILD_MEMBER_ADD,
  listener: async (
    client: CommandClient,
    payload: GatewayClientEvents.GuildMemberAdd
  ) => {
    let member = payload.member;
    let guild = payload.member.guild!;

    await client.checkGuild(payload.guildId).then(async () => {
      let results: any[] = await client.query(
        `SELECT * FROM \`Servers\` WHERE \`ServerID\` = '${payload.guildId}'`
      );

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
