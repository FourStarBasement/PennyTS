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

    if (!mention) {
      let data: DBUser[] = await ctx.commandClient.query(
        `SELECT CT FROM \`User\` WHERE \`User_ID\`=${ctx.member!.id}`
      );
      if (data[0].CT === 0) {
        // Typing is incorrect, it returns a CronDate, not Date.
        let nextInvocation = ctx.commandClient.job.nextInvocation();
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
        let data: DBUser[] = await ctx.commandClient.query(
          `SELECT \`CT\` FROM \`User\` WHERE \`User_ID\` = ${ctx.member!.id}`
        );
        if (data[0].CT) {
          await ctx.commandClient.query(
            `UPDATE \`User\` SET \`CT\`= 0 WHERE \`User_ID\` = ${
              ctx.member!.id
            }`
          );
          await ctx.commandClient.query(
            `UPDATE \`User\` SET \`Cookie\`=\`Cookie\`+1 WHERE \`User_ID\` = ${mention.id}`
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
