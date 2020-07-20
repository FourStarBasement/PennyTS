import { Context } from 'detritus-client/lib/command';
import { QueryType } from '../../modules/db';
import { ChannelGuildText } from 'detritus-client/lib/structures';
import { chanReg } from '../../modules/utils';

interface CommandArgs {
  'set starboard': string;
}

export const setStarboard = {
  name: 'set starboard',
  metadata: {
    description: 'Sets the starboard chat',
    checks: ['userAdmin'],
  },
  run: async (ctx: Context, args: CommandArgs) => {
    // Too lazy to change prefix to channel
    const prefix = args['set starboard'];
    let chan: ChannelGuildText | undefined;
    if (chanReg.test(prefix)) {
      let channelID = chanReg.exec(prefix)![1];
      chan = ctx.guild!.channels.get(channelID);
    } else if (isNaN(Number(prefix))) {
      chan = ctx.guild!.channels.find((c) => c.name === prefix);
    } else {
      chan = ctx.guild?.channels.get(prefix);
    }
    if (!chan) {
      ctx.reply(`Usage: ${ctx.prefix}set starboard #starboard.`);
      return;
    }

    console.log(chan.id);
    await ctx.commandClient.preparedQuery(
      'UPDATE servers SET starboard_channel = $1 WHERE server_id = $2',
      [chan.id, ctx.guildId],
      QueryType.Void
    );

    ctx.reply(`Successfully made the Starboard chat ${prefix}`);
  },
};
