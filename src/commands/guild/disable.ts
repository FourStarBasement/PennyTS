import { Context } from 'detritus-client/lib/command';

interface CommandArgs {
  disable: string;
}

export const disable = {
  name: 'disable',
  metadata: {
    description: 'Disables levels or mod logs or role edits',
    checks: ['userAdmin'],
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args.disable) {
      ctx.reply(`Usage: ${ctx.prefix}disable [thing to disable]`);
      return;
    }

    let attr;
    let toSay = '';

    switch (args.disable) {
      case 'levels':
        attr = toSay = args.disable;
        ctx.guild!.levels = 0;
        break;

      case 'mod logs':
        attr = 'mod_log';
        toSay = 'mod logs';
        break;

      case 'edits':
        attr = 'edits';
        toSay = 'role edits';
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
      .query(`UPDATE servers SET ${attr} = 0 WHERE server_id = ${ctx.guildId}`)
      .then((v) => {
        ctx.reply(`Disabled ${toSay}.`);
      });
  },
};
