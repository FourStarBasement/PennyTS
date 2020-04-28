import { CommandOptions, Context } from 'detritus-client/lib/command';
import moment from 'moment';
import { humanize } from '../modules/utils';

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

    let res = await ctx.commandClient.query(
      `SELECT \`DailyTime\`, \`patron\` FROM \`User\` WHERE \`User_ID\` = '${user.id}'`
    );
    let amount = Math.floor(Math.random() * (1000 - 500)) + 500;

    if (res[0].patron === 1) amount += 500;

    if (res[0].DailyTime === 1) {
      if (user.id === ctx.member!.id) {
        await ctx.commandClient.query(
          `UPDATE \`User\` SET \`DailyTime\` = 0,\`Credits\`=\`Credits\` + ${amount} WHERE \`User_ID\` = '${user.id}'`
        );
        ctx.reply(`💸 Here's your ${amount} credits 💸`);
      } else {
        amount = Math.floor(Math.random() * (2000 - 1000)) + 1000;

        await ctx.commandClient.query(
          `UPDATE \`User\` SET \`Credits\`=\`Credits\` + ${amount} WHERE \`User_ID\` = '${user.id}'`
        );
        await ctx.commandClient.query(
          `UPDATE \`User\` SET \`DailyTime\` = 0 WHERE \`User_ID\` = '${
            ctx.member!.id
          }'`
        );
        ctx.reply(
          `💸 ${ctx.member!.username} just gave ${
            user.username
          } ${amount} daily credits! 💸`
        );
      }
    } else {
      // Typing is incorrect, it returns a CronDate, not Date.
      let nextInvocation = ctx.commandClient.job.nextInvocation();
      let dur = moment.duration(nextInvocation.toDate() - Date.now());
      ctx.reply(`Your daily will reset in ${humanize(dur)}.`);
    }
  },
};
