import { Context } from 'detritus-client/lib/command';
import { GuildFlags } from '../../modules/utils';

interface CommandArgs {
  disable: string;
}

export const disable = {
  name: 'disable',
  metadata: {
    description:
      'Disables levels or mod logs or role edits or a specific command',
    checks: ['userAdmin'],
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args.disable) {
      ctx.reply(
        `Usage: ${ctx.prefix}disable {mod logs/levels/role edits/command}`
      );
      return;
    }

    let attr;
    let toSay = '';

    switch (args.disable) {
      case 'levels':
        attr = toSay = args.disable;
        ctx.guild!.flags &= GuildFlags.LEVELS;
        break;

      case 'mod logs':
        attr = 'mod_log';
        toSay = 'mod logs';
        ctx.guild!.flags &= GuildFlags.MOD_LOGS;
        break;

      case 'edits':
        attr = 'edits';
        toSay = 'role edits';
        ctx.guild!.flags &= GuildFlags.ROLE_EDITS;
        break;

      default:
        break;
    }

    if (!attr) {
      ctx.reply(
        'Invalid feature. Available features: `levels`, `mod logs`, `role edits`, `command`'
      );
      return;
    }
    ctx.commandClient
      .query(
        `UPDATE servers SET flags = ${ctx.guild!.flags} WHERE server_id = ${
          ctx.guildId
        }`
      )
      .then((v) => {
        ctx.reply(`Disabled ${toSay}.`);
      });
  },
};
