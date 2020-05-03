import { Context } from 'detritus-client/lib/command';

interface CommandArgs {
  welcome: string;
}

export const welcome = {
  name: 'welcome',
  metadata: {
    description: 'Enables/Disables welcome messages.',
    checks: ['userAdmin'],
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args.welcome) {
      ctx.reply(`Usage: ${ctx.prefix}welcome [on/off]`);
    } else {
      await ctx.commandClient.checkGuild(ctx.guildId!).then(() => {
        if (args.welcome.toLowerCase() === 'on') {
          ctx.commandClient
            .query(
              `UPDATE \`Servers\` SET \`Welcome\` = 1 WHERE \`ServerID\` = '${ctx.guildId}'`
            )
            .then(() => {
              ctx.reply('Successfully turned on welcome messages.');
            });
        } else if (args.welcome.toLowerCase() === 'off') {
          ctx.commandClient
            .query(
              `UPDATE \`Servers\` SET \`Welcome\` = 0 WHERE \`ServerID\` = '${ctx.guildId}'`
            )
            .then(() => {
              ctx.reply('Successfully turned off welcome messages.');
            });
        } else {
          ctx.reply(`Usage: ${ctx.prefix}welcome [on/off]`);
        }
      });
    }
  },
};
