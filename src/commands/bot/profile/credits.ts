import { Context } from 'detritus-client/lib/command';
import { DBUser } from '../../../modules/db';

export const credits = {
  name: 'credits',
  metadata: {
    description: "View your credits or someone else's credits.",
  },
  run: async (ctx: Context) => {
    let user = ctx.commandClient.fetchGuildMember(ctx) || ctx.member;
    if (user!.bot) {
      ctx.reply('Silly you! Bots have no use for money.');
      return;
    }
    let data: DBUser = await ctx.commandClient.queryOne(
      `SELECT credits FROM users WHERE user_id = ${user!.id}`
    );
    ctx.reply(`💸 ${user?.username} has ${data.credits} credits. 💸`);
  },
};
