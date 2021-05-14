import { Context } from 'detritus-client/lib/command';
import { MessageCollector } from '../../modules/collectors/messageCollector';
import { Message } from 'detritus-client/lib/structures';
import { DBUser } from '../../modules/db';

export const mir = {
  name: 'mir',
  metadata: {
    description:
      'Makes it rain a random amount of credits. The first person to type grab wins them.',
  },
  run: async (ctx: Context) => {
    const cr = Math.floor(Math.random() * 1000);
    let data: DBUser = await ctx.commandClient.queryOne(
      `SELECT credits from users WHERE user_id = ${ctx.member!.id}`
    );
    if (data.credits < cr) {
      ctx.reply('You do not have enough credits to perform this command.');
      return;
    }
    ctx.commandClient.query(
      `UPDATE users SET credits = credits - ${cr} WHERE user_id = ${
        ctx.member!.id
      }`
    );
    let filter = (m: Message) => {
      return (
        m.author.id !== ctx.member!.id &&
        m.content.toLowerCase() === `${ctx.prefix}grab`
      );
    };
    ctx.reply(
      `${
        ctx.member!.username
      } has just thrown ${cr} credits in the air! The first person to grab them by saying "${
        ctx.prefix
      }grab" gets to keep them!`
    );

    let collector = new MessageCollector(ctx, 30000, filter);
    collector.on('collect', (m: Message) => {
      collector.destroy();
      ctx.commandClient.query(
        `UPDATE users SET credits = credits + ${cr} WHERE user_id = ${
          m.member!.id
        }`
      );
      ctx.reply(
        `Congrats to ${m.member!.username}! They just won ${cr} credits!`
      );
    });

    collector.on('end', () => {
      ctx.reply('It seems as if no one has picked up the credits. Oh well.');
      ctx.commandClient.query(
        `UPDATE users SET credits = credits + ${cr} WHERE user_id = ${
          ctx.member!.id
        }`
      );
    });

    collector.start();
  },
};
