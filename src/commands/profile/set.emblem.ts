import { Context } from 'detritus-client/lib/command';
import { items } from '../../modules/shop';
import { DBUser } from '../../modules/db';
interface CommandArgs {
  'set emblem': string;
}
export const setEmblem = {
  name: 'set emblem',
  metadata: {
    description: 'Sets your profile emblem.',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args['set emblem']) {
      ctx.reply(
        `Usage: ${ctx.prefix}set emblem {emblem (for emblem options do ${ctx.prefix}shopinfo emblems)}.`
      );
      return;
    }

    // TODO: Do this
    let emblems = await ctx.commandClient.query(
      `SELECT COUNT(*) AS hasB FROM user_emblems WHERE user_id = ${ctx.userId} AND emblem = '${args['set emblem']}'`
    );
    let data: DBUser = await ctx.commandClient.queryOne(
      `SELECT credits FROM users WHERE user_id = ${ctx.userId}`
    );
    if (
      items[args['set emblem']] &&
      items[args['set emblem']].type === 'emblem'
    ) {
      const bg = items[args['set emblem']];
      const price = Number(bg.price);

      if (isNaN(price)) {
        ctx.reply('Hm, the price is somehow not a number! Contact the devs!');
        return;
      }

      if (price > data.credits)
        ctx.reply('You do not have enough credits for this emblem.');
        return;
      }
      await ctx.commandClient.query(
        `UPDATE users SET emblem = '${bg.name}', credits=credits - ${bg.price} WHERE user_id = ${ctx.userId}`
      );
      if (emblems.hasB === 0)
        await ctx.commandClient.query(
          `INSERT INTO user_emblems (user_id, emblem) VALUES (${ctx.user}, '${bg}')`
        );
      ctx.reply(`Equipped ${bg.name} as your profile emblem!`);
    } else {
      ctx.reply(
        `Unknown emblem. For emblem options do ${ctx.prefix}shopinfo emblems`
      );
    }
  },
};
