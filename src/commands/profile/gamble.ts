import { Context } from 'detritus-client/lib/command';
import { DBUser } from '../../modules/db';
import { Message, Member } from 'detritus-client/lib/structures';
import { MessageCollector } from '../../modules/collectors/messageCollector';

interface CommandArgs {
  gamble: number;
}

export const gamble = {
  name: 'gamble',
  metadata: {
    description: 'Gamble your life away',
  },
  arg: {
    name: 'amount',
    type: BigInt,
  },
  run: async (ctx: Context, args: CommandArgs) => {
    const member = ctx.member as Member;
    let credits: bigint = BigInt(0);

    // I hate this.
    try {
      credits = args.gamble ? BigInt(args.gamble) : BigInt(100);
    } catch (e) {
      ctx.reply('Please provide me with a valid number!');
      return;
    }

    if (credits <= 0) {
      ctx.reply('You cant gamble no credits!');
      return;
    }

    // Check if they have enough credits to proceed.
    let user: DBUser = await ctx.commandClient.queryOne(
      `SELECT credits FROM users WHERE user_id = ${member.id}`
    );

    if (user.credits < credits) {
      ctx.reply(`You do not have ${credits} credits!`);
      return;
    }

    ctx.reply(
      `Are you sure you want to gamble ${credits} credits? Type yes or no`
    );

    const filter = (message: Message) => message.author.id === member.id;

    const collector = new MessageCollector(ctx, 10000, filter);
    collector.on('collect', (message: Message) => {
      const content = message.content.toLowerCase();
      let toGive = BigInt(user.credits);

      // TODO: Allow multiple answers
      if (content === 'yes') {
        const rand = Math.floor(Math.random() * 21);

        if (rand >= 13) {
          toGive += credits;
          ctx.reply(`You won ${credits} credits. Congrats!!`);
        } else {
          toGive -= credits;
          ctx.reply(`It looks like you lost ${credits} credits, Sorry!`);
        }

        collector.destroy();
        ctx.commandClient.query(
          `UPDATE users SET credits = ${toGive} WHERE user_id = ${member.id}`
        );
      } else if (content === 'no') {
        collector.destroy();
        ctx.reply('Gamble cancelled');
      }
    });

    collector.on('end', () => {
      ctx.reply('You took too long, gamble cancelled!');
    });
  },
};
