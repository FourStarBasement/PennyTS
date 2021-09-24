import { Context } from 'detritus-client/lib/command';

interface CommandArgs {
  fm: string;
}
export const fm = {
  name: 'fm',
  metadata: {
    description: 'Set last.fm info',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args.fm) {
      ctx.reply(`Usage: ${ctx.prefix}fm {add/remove/stats} {last.fm username}`);
      return;
    }

    if (args.fm !== 'remove') {
      ctx.reply(`Usage: ${ctx.prefix}fm remove`);
      return;
    }

    await ctx.commandClient.query(
      `UPDATE users SET last_fm_name = '' WHERE user_id = ${ctx.userId}`
    );
    ctx.reply('Removed your last.fm username');
  },
};
