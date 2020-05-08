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

    let emblems = await ctx.commandClient.query(
      `SELECT COUNT(*) AS hasB FROM \`userE\` WHERE \`userID\` = ${ctx.userId} AND \`emblem\` = '${args['set emblem']}'`
    );
    let data: DBUser[] = await ctx.commandClient.query(
      `SELECT \`Credits\` FROM \`User\` WHERE \`User_ID\` = ${ctx.userId}`
    );
    if (
      items[args['set emblem']] &&
      items[args['set emblem']].type === 'emblem'
    ) {
      let bg = items[args['set emblem']];
      if (bg.price > data[0].Credits.toString()) {
        ctx.reply('You do not have enough credits for this emblem.');
        return;
      }
      await ctx.commandClient.query(
        `UPDATE \`User\` SET \`emblem\` = '${bg.name}', \`Credits\`=\`Credits\` - ${bg.price} WHERE \`User_ID\` = ${ctx.userId}`
      );
      if (emblems.hasB === 0)
        await ctx.commandClient.query(
          `INSERT INTO \`userE\` (\`userID\`, \`emblem\`) VALUES (${ctx.user}, '${bg}')`
        );
      ctx.reply(`Equipped ${bg.name} as your profile emblem!`);
    } else {
      ctx.reply(
        `Unknown emblem. For emblem options do ${ctx.prefix}shopinfo emblems`
      );
    }
  },
};
