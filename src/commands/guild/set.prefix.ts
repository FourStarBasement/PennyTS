import { Context } from 'detritus-client/lib/command';
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
    if (!args['set prefix']) {
      ctx.reply(`Usage: ${ctx.prefix}set prefix newprefix.`);
      return;
    }
    if (args['set prefix'].length > 5) {
      ctx.reply('Prefix must be smaller than 6 characters.');
      return;
    }

    // TODO: Prepared statement
    await ctx.commandClient.query(
      `UPDATE servers SET prefix = '${args['set prefix']}' WHERE server_id = ${ctx.guildId}`
    );
    ctx.guild!.prefix = args['set prefix'];
    ctx.reply(`This server's prefix is now ${args['set prefix']}`);
  },
};
