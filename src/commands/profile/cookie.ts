import { Context } from 'detritus-client/lib/command';
import images from '../../modules/images';
import moment from 'moment';
import { humanize } from '../../modules/utils';
import fetch from 'node-fetch';
import { DBUser } from '../../modules/db';

interface CommandArgs {
  cookie: string;
}

export const cookie = {
  name: 'cookie',
  metadata: {
    description: 'Give someone a cookie. Please.',
  },
  arg: { name: 'user' },
  run: async (ctx: Context, args: CommandArgs) => {
    let mention = ctx.commandClient.fetchGuildMember(ctx);

    if (args.cookie && !mention) {
      ctx.reply('Please mention a valid user.');
      return;
    }

    let user: DBUser = await ctx.commandClient.queryOne(
      `SELECT cookie_time FROM users WHERE user_id=${ctx.member!.id}`
    );

    if (!mention) {
      if (!user.cookie_time) {
        // Typing is incorrect, it returns a CronDate, not Date.
        let nextInvocation = ctx.commandClient.job.nextInvocation() as any;
        let dur = moment.duration(nextInvocation.toDate() - Date.now());
        ctx.reply(`You can give someone a cookie in ${humanize(dur)}.`);
      } else {
        ctx.reply('**You can give someone a cookie.**');
      }
    } else {
      if (mention.id === ctx.member!.id) {
        ctx.reply("You can't give yourself a cookie!");
      } else if (mention.bot) {
        ctx.reply("You can't give bots cookies!");
      } else {
        if (user.cookie_time) {
          await ctx.commandClient.query(
            `UPDATE users SET cookie_time=false WHERE user_id= ${
              ctx.member!.id
            }`
          );
          await ctx.commandClient.query(
            `UPDATE users SET cookies=cookies+1 WHERE user_id = ${mention.id}`
          );

          let cookieImage = undefined;

          if (ctx.channel?.canAttachFiles) {
            let gif =
              images.cookie[Math.floor(Math.random() * images.cookie.length)];
            let img = await fetch(gif).then(async (r) => r.buffer());
            cookieImage = { filename: 'cookie.gif', data: img };
          }

          ctx.reply({
            content: `${ctx.member!.username} just gave ${
              mention.username
            } a cookie!`,
            file: cookieImage,
          });
        } else {
          // Typing is incorrect, it returns a CronDate, not Date.
          let nextInvocation = ctx.commandClient.job.nextInvocation();
          let dur = moment.duration(nextInvocation.toDate() - Date.now());
          ctx.reply(`You can give someone a cookie in ${humanize(dur)}.`);
        }
      }
    }
  },
};
