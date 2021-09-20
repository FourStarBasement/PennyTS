import { Context } from 'detritus-client/lib/command';
import { QueryType } from '../../../modules/db';

interface CommandArgs {
  'set star limit': number;
}

export const setStarLimit = {
  name: 'set star limit',
  metadata: {
    description: 'Sets the minimum stars needed to post in starboard',
    checks: ['userAdmin'],
  },
  run: async (ctx: Context, args: CommandArgs) => {
    let limit = args['set star limit'];
    if (!limit) {
      ctx.reply(`Usage: ${ctx.prefix}set star limit {number}`);
      return;
    }
    if (isNaN(limit)) {
      ctx.reply('Star limit must be a number!');
      return;
    }
    if (limit < 1) {
      ctx.reply('Pick a number greater than 0!');
      return;
    }

    ctx.commandClient.preparedQuery(
      'UPDATE servers SET star_limit = $1 WHERE server_id = $2',
      [limit, ctx.guildId],
      QueryType.Void
    );
    ctx.reply(`Successfully set the star limit to ${limit}!`);
  },
};
