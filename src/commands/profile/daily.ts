import { Context } from 'detritus-client/lib/command';
import moment from 'moment';
import { humanize } from '../../modules/utils';
import { DBUser, UserFlags } from '../../modules/db';

export const daily = {
  name: 'daily',
  metadata: {
    description: 'Get your daily credits. Or give them to someone else.',
  },
  run: async (ctx: Context) => {
    let user = ctx.commandClient.fetchGuildMember(ctx) || ctx.message.author;

    if (user === undefined) return;

    if (user.bot) {
      ctx.reply('Bots have no use for money.');
      return;
    }

    let dbUser: DBUser = await ctx.commandClient.queryOne(
      `SELECT daily_time, flags FROM users WHERE user_id = ${ctx.member!.id}`
    );
    let amount = Math.floor(Math.random() * (1000 - 500)) + 500;

    if (ctx.commandClient.hasFlag(dbUser.flags, UserFlags.Patron))
      amount += 500;

    if (dbUser.daily_time) {
      if (user.id === ctx.member!.id) {
        await ctx.commandClient.query(
          `UPDATE users SET daily_time = false,credits=credits + ${amount} WHERE user_id = ${user.id}`
        );
        ctx.reply(`💸 Here's your ${amount} credits 💸`);
      } else {
        amount = Math.floor(Math.random() * (2000 - 1000)) + 1000;

        await ctx.commandClient.query(
          `UPDATE users SET credits=credits + ${amount} WHERE user_id = ${user.id}`
        );
        await ctx.commandClient.query(
          `UPDATE users SET daily_time = false WHERE user_id = ${
            ctx.member!.id
          }`
        );
        ctx.reply(
          `💸 ${ctx.member!.username} just gave ${
            user.username
          } ${amount} daily credits! 💸`
        );
      }
    } else {
      // Typing is incorrect, it returns a CronDate, not Date.
      let nextInvocation: any = ctx.commandClient.job.nextInvocation();
      let dur = moment.duration(nextInvocation.toDate() - Date.now());
      ctx.reply(`Your daily will reset in ${humanize(dur)}.`);
    }
  },
};
