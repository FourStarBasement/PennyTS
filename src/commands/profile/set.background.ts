import { Context } from 'detritus-client/lib/command';
import { items } from '../../modules/shop';
import { DBUser } from '../../modules/db';
interface CommandArgs {
  'set background': string;
}
export const setBackground = {
  name: 'set background',
  metadata: {
    description: 'Sets the server background',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args['set background']) {
      ctx.reply(
        `Usage: ${ctx.prefix}set background {background (for background options check https://penny.wiggy.dev/backgrounds or do ${ctx.prefix}shopinfo backgrounds)}.`
      );
      return;
    }
    if (args['set background'] === 'default') {
      await ctx.commandClient
        .query(
          `UPDATE users SET background = 'default' WHERE user_id = ${ctx.userId}`
        )
        .catch(console.error);
      ctx.reply(
        'Your profile will now display your role color as your background.'
      );
      return;
    }

    // TODO: Do this
    let backgrounds = await ctx.commandClient.query(
      `SELECT COUNT(*) AS hasB FROM userB WHERE User_ID = ${ctx.userId} AND name = '${args['set background']}'`
    );
    let data: DBUser = await ctx.commandClient.queryOne(
      `SELECT patron, credits FROM User WHERE User_ID = ${ctx.userId}`
    );
    if (args['set background'] === 'patreon') {
      if (!data.patron) {
        ctx.reply(
          'You are not a patron! Consider donating here. Making bots is hard sometimes... <https://www.patreon.com/lilwiggy>'
        );
        return;
      }
      await ctx.commandClient.query(
        `UPDATE User SET background = 'patreon' WHERE User_ID = ${ctx.userId}`
      );
      ctx.reply(
        'Your background is now the patreon background! Thanks a ton for your support <3'
      );
      return;
    }

    if (
      items[args['set background']] &&
      items[args['set background']].type === 'background'
    ) {
      let bg = items[args['set background']];
      if (bg.price > data.credits.toString()) {
        ctx.reply('You do not have enough credits for this background.');
        return;
      }
      await ctx.commandClient.query(
        `UPDATE User SET background = '${bg.name}', Credits=Credits - ${bg.price} WHERE User_ID = ${ctx.userId}`
      );
      if (backgrounds.hasB === 0)
        await ctx.commandClient.query(
          `INSERT INTO userB (User_ID, name) VALUES (${ctx.user}, '${bg}')`
        );
      ctx.reply(`Equipped ${bg.name} as your profile background!`);
    } else {
      ctx.reply(
        `Unknown background. Check https://penny.wiggy.dev/backgrounds for background options or try ${ctx.prefix}shopinfo backgrounds`
      );
    }
  },
};
