import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import { DBUser } from '../../modules/db';

interface CommandArgs {
  ht: string;
}
export const ht = {
  name: 'ht',
  arg: {
    name: 'ht',
  },
  metadata: {
    description: 'Heads or tails?',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args.ht) {
      ctx.reply(`Usage: ${ctx.prefix}ht {heads/tails}`);
      return;
    }
    const hts: Array<string> = ['heads', 'tails'];
    const ht = hts[Math.floor(Math.random() * hts.length)];
    const accept: Array<string> = ['head', 'h', 'heads', 'tail', 't', 'tails'];
    if (!accept.includes(args.ht.toLowerCase())) {
      ctx.reply(`Usage: ${ctx.prefix}ht {heads/tails}`);
      return;
    }

    let data: DBUser[] = await ctx.commandClient.query(
      `SELECT \`Credits\` FROM \`User\` WHERE \`User_ID\` = ${ctx.member!.id}`
    );
    if (data[0].Credits < 1) {
      ctx.reply('You do not have enough credits to perform this command.');
      return;
    }
    if (ht.startsWith(args.ht.toLowerCase())) {
      ctx.commandClient.query(
        `UPDATE \`User\` SET \`Credits\`=\`Credits\`+2 WHERE \`User_ID\` = ${
          ctx.member!.id
        }`
      );
      ctx.reply(`It was ${ht}! Congrats! You won exactly 1 (one) credit!`);
    } else {
      ctx.reply({
        content: `It was ${ht}. Seems like you lost. Sad.`,
        file: {
          data: await fetch('https://i.imgur.com/d8w9ElP.png').then((d) =>
            d.buffer()
          ),
          filename: 'tryagain.png',
        },
      });
    }
  },
};
