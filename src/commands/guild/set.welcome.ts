import { Context } from 'detritus-client/lib/command';
import { chanReg, roleReg } from '../../modules/utils';
import parser from 'yargs';
import { escape } from 'mysql';
import { ChannelGuildText, Role } from 'detritus-client/lib/structures';

const argsParser = parser
  .option('message', {
    alias: 'm',
    describe: `set the welcome message format
      To refer to the user's name, use \`{user}\`.
      To refer to the guild's name, use \`{guild}\`.`,
    array: true,
    type: 'string',
    demandOption: false,
  })
  .option('channel', {
    alias: 'c',
    describe: 'set the welcome channel',
    type: 'string',
    demandOption: false,
  })
  .option('role', {
    alias: 'r',
    describe: 'set the welcome role',
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

export const setWelcome = {
  name: 'set welcome',
  metadata: {
    description: 'Set the welcome channel, message, or role.',
    checks: ['userAdmin'],
  },
  run: async (ctx: Context, args: Record<string, string>) => {
    let parsed = argsParser.parse(args['set welcome']);

    let messages: string[] = [];

    if (parsed.help && !parsed.channel && !parsed.message && !parsed.role) {
      let help = '';
      argsParser.showHelp((s: string) => (help = s));

      messages.push(`\`\`\`\n${help}\`\`\``);
    }

    if (parsed.message) {
      let welcome_message = parsed.message.join(' ');
      if (
        welcome_message.includes('@everyone') &&
        welcome_message.includes('@here')
      ) {
        messages.push(
          "Message: I'm sorry but I can't add an everyone mention."
        );
      } else {
        await ctx.commandClient
          .query(
            `UPDATE \`Servers\` SET \`WMessage\` = ${escape(
              welcome_message
            )} WHERE \`ServerID\` = '${ctx.guildId}'`
          )
          .then(() => {
            messages.push('Welcome Message: Successfully Set!');
          });
      }
    }

    if (parsed.channel) {
      let channel: ChannelGuildText | undefined;

      if (parsed.channel.startsWith('<#') && parsed.channel.endsWith('>')) {
        // Channel Mention
        var channelID = chanReg.exec(parsed.channel)![1];
        channel = ctx.guild!.channels.get(channelID);
      } else if (isNaN(Number(parsed.channel))) {
        // Channel Name
        channel = ctx.guild!.channels.find((v, k) => v.name === parsed.channel);
      } else {
        // Channel ID (Last Resort)
        channel = ctx.guild!.channels.get(parsed.channel);
      }

      if (!channel) {
        messages.push(
          "Welcome Channel: Sorry, I couldn't find the channel you provided!"
        );
      } else {
        await ctx.commandClient
          .query(
            `UPDATE \`Servers\` SET \`wc\` = ${channel.id} WHERE \`ServerID\` = '${ctx.guildId}'`
          )
          .then(() =>
            messages.push(
              `Welcome Channel: Successfully set as ${channel!.mention}!`
            )
          );
      }
    }

    if (parsed.role) {
      let role: Role | undefined;
      let unset = false;

      console.log(role, unset);

      if (parsed.role === '$none') {
        await ctx.commandClient
          .query(
            `UPDATE \`Servers\` SET \`WelcomeR\` = NULL WHERE \`ServerID\` = '${ctx.guildId}'`
          )
          .then(() => {
            unset = true;
          });
      } else if (parsed.role.startsWith('<@&') && parsed.role.startsWith('>')) {
        // Role Mention
        var roleID = roleReg.exec(parsed.role)![1];
        role = ctx.guild!.roles.get(roleID);
      } else if (isNaN(Number(parsed.role))) {
        // Role Name
        role = ctx.guild!.roles.find((v, k) => v.name === parsed.role);
      } else {
        // Role ID (Last Resort)
        role = ctx.guild!.roles.get(parsed.role);
      }

      console.log(role, unset);

      if (!role && !unset) {
        messages.push(
          "Welcome Role: Sorry, I couldn't find the role you provided!"
        );
      } else if (role && !unset) {
        await ctx.commandClient
          .query(
            `UPDATE \`Servers\` SET \`WRole\` = '${role.id}' WHERE \`ServerID\` = '${ctx.guildId}'`
          )
          .then(() =>
            messages.push(
              `Welcome Role: Successfully set as \`\`${role!.name}\`\`!`
            )
          );
      } else {
        messages.push('Welcome Role: Successfully unset!');
      }
    }

    await ctx.reply(messages.join('\n'));
  },
};
