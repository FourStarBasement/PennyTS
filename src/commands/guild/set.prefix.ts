import { Context } from 'detritus-client/lib/command';
import { QueryType } from '../../modules/db';

interface CommandArgs {
  'set prefix': string;
}

export const setPrefix = {
  name: 'set prefix',
  metadata: {
    description: 'Sets the server prefix',
    checks: ['userAdmin'],
  },
  run: async (ctx: Context, args: CommandArgs) => {
    const prefix = args['set prefix'];
    if (!prefix) {
      ctx.reply(`Usage: ${ctx.prefix}set prefix newprefix.`);
      return;
    }
    if (prefix.length > 5) {
      ctx.reply('Prefix must be smaller than 6 characters.');
      return;
    }

    await ctx.commandClient.preparedQuery(
      'UPDATE servers SET prefix = $1 WHERE server_id = $2',
      [prefix, ctx.guildId],
      QueryType.Void
    );

    ctx.guild!.prefix = prefix;
    ctx.reply(`This server's prefix is now ${prefix}`);
  },
};
