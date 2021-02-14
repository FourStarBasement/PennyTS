import { Context } from 'detritus-client/lib/command';
import { GuildFlags } from '../../modules/utils';

interface CommandArgs {
  disable: string;
}

export const disable = {
  name: 'disable',
  metadata: {
    description:
      'Disables levels or mod logs or role edits or auto quotes or a specific command or server welcome messages',
    checks: ['userAdmin'],
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args.disable) {
      ctx.reply(
        `Usage: ${ctx.prefix}disable {mod logs/levels/role edits/command/auto quotes/welcomes}`
      );
      return;
    }

    let toSay = '';

    switch (args.disable) {
      case 'levels':
        toSay = 'level up messages';
        ctx.guild!.flags &= ~GuildFlags.LEVELS;
        break;

      case 'mod logs':
        toSay = 'mod logs';
        ctx.guild!.flags &= ~GuildFlags.MOD_LOGS;
        break;

      case 'edits':
        toSay = 'role edits';
        ctx.guild!.flags &= ~GuildFlags.ROLE_EDITS;
        break;
      case 'auto quote':
      case 'auto quotes':
      case 'quotes':
        toSay = 'auto message quoting';
        ctx.guild!.flags &= ~GuildFlags.AUTO_QUOTE;
        break;
      case 'welcomes':
      case 'welcome':
        ctx.guild!.flags &= ~GuildFlags.WELCOMES;
        break;
      default:
        break;
    }

    if (!toSay) {
      ctx.reply(
        'Invalid feature. Available features: `levels`, `mod logs`, `role edits`, `command`, `auto quotes`, `welcomes`'
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
