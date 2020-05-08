import { Context } from 'detritus-client/lib/command';
import { escape } from 'mysql';

export const setLeave = {
  name: 'set leave',
  metadata: {
    description: 'Set the leave message.',
    checks: ['userAdmin'],
  },
  run: async (ctx: Context, args: Record<string, string>) => {
    if (!args['set leave']) {
      ctx.reply(`Usage: ${ctx.prefix}set leave {message} [value]`);
      return;
    }
    let splitArgs = args['set leave'].split(' ');
    let attr = splitArgs.shift();
    let value = splitArgs.join(' ');

    if (!value) {
      ctx.reply(`Please provide a value!`);
      return;
    }

    if (attr === 'message') {
      let leave_message = value;
      if (
        leave_message.includes('@everyone') &&
        leave_message.includes('@here')
      ) {
        ctx.reply(
          "Leave Message: I'm sorry but I can't add an everyone mention."
        );
      } else {
        await ctx.commandClient
          .query(
            `UPDATE \`Servers\` SET \`LMessage\` = ${escape(
              leave_message
            )} WHERE \`ServerID\` = '${ctx.guildId}'`
          )
          .then(() => {
            ctx.reply('Leave Message: Successfully set!');
          });
      }
      return;
    }

    ctx.reply(`Usage: ${ctx.prefix}set leave {message} [value]`);
  },
};
