import { Context } from 'detritus-client/lib/command';
import parser from 'yargs';
import { escape } from 'mysql';

export const setLeave = {
  name: 'set leave',
  metadata: {
    description: 'Set the leave message.',
    checks: ['userAdmin'],
  },
  run: async (ctx: Context, args: Record<string, string>) => {
    let argsParser = parser
      .reset()
      .option('message', {
        alias: 'm',
        describe: `set the welcome message format
      To refer to the user's name, use \`{user}\`.
      To refer to the guild's name, use \`{guild}\`.`,
        array: true,
        type: 'string',
        demandOption: false,
      })
      .option('help', {
        alias: ['h', '?'],
        describe: 'help',
        default: true,
        hidden: true,
      })
      .exitProcess(false)
      .version(false);

    let parsed = argsParser.parse(args['set leave']);

    let messages: string[] = [];

    if (parsed.help && !parsed.message) {
      let help = '';
      argsParser.showHelp((s: string) => (help = s));

      messages.push(`\`\`\`\n${help}\`\`\``);
    }

    if (parsed.message) {
      let leave_message = parsed.message.join(' ');
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
    }
  },
};
