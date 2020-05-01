import { Context } from 'detritus-client/lib/command';

interface CommandArgs {
  disable: string;
}

export const disable = {
  name: 'disable',
  metadata: {
    description: 'Disables levels or mod logs',
    checks: ['userAdmin'],
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args.disable) {
      ctx.reply(`Usage: ${ctx.prefix}disable [thing to disable]`);
      return;
    }

    let attr;

    switch (args.disable) {
      case 'levels':
        attr = 'levels';
        break;

      case 'mod logs':
        attr = 'mod_log';
        break;

      case 'role edits':
        attr = 'edits';
        break;

      default:
        break;
    }

    if (!attr) {
      ctx.reply(
        'Invalid feature. Available features: `levels`, `mod logs`, `role edits`'
      );
      return;
    }

    ctx.commandClient
      .query(
        `UPDATE \`Servers\` SET \`${attr}\` = 0 WHERE \`ServerID\` = '${ctx.guildId}'`
      )
      .then((v) => {
        ctx.reply(`Disabled ${args.disable}.`);
      });
  },
};
