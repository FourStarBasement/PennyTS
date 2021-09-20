import { Context } from 'detritus-client/lib/command';
import { UserFlags } from '../../../modules/db';

interface CommandArgs {
  weeb: string;
}
export const weeb = {
  name: 'weeb',
  arg: {
    name: 'state',
  },
  metadata: {
    description: 'Disables/enables the anime gifs for the hug command.',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (
      !args.weeb ||
      (args.weeb.toLowerCase() !== 'on' && args.weeb.toLowerCase() !== 'off')
    ) {
      ctx.reply(`Usage: ${ctx.prefix}weeb {on/off}`);
      return;
    }

    if (args.weeb.toLowerCase() === 'on') {
      ctx.commandClient.query(
        `UPDATE users SET flags = flags | ${UserFlags.Weeb} WHERE user_id = ${
          ctx.member!.id
        }`
      );
      ctx.reply('You will now receive anime images from the hug command.');
    } else {
      ctx.commandClient.query(
        `UPDATE users SET flags = flags & ~${UserFlags.Weeb} WHERE user_id = ${
          ctx.member!.id
        }`
      );
      ctx.reply(
        'You will no longer receive anime images from the hug command.'
      );
    }
  },
};
