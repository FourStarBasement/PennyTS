import { Context } from 'detritus-client/lib/command';
import { Message } from 'detritus-client/lib/structures';
import { MessageCollector } from '../../../modules/collectors/messageCollector';
import { chanReg } from '../../../modules/utils';
import { ServerFlags } from '../../../modules/db';

interface CommandArgs {
  enable: string;
}

export const enable = {
  name: 'enable',
  metadata: {
    description:
      'Enables mod logs, levels, or role edits or server welcome messages',
    checks: ['userAdmin'],
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args.enable) {
      ctx.reply(
        `Usage: ${ctx.prefix}enable [levels/mod logs/role edits/auto quotes/welcomes]`
      );
      return;
    }

    let attr: string = '';
    switch (args.enable) {
      case 'levels':
        attr = 'level up messages';
        ctx.guild!.flags |= ServerFlags.LEVELS;
        break;
      case 'mod logs':
        ctx.guild!.flags |= ServerFlags.MOD_LOGS;
        ctx.reply('Please mention the chat for logs to be sent to:');
        let filter = (m: Message) =>
          m.author.id === ctx.member!.id && chanReg.test(m.content);
        let collector = new MessageCollector(ctx, 15000, filter);
        collector.on('collect', (m: Message) => {
          let channelID = m.content.match(chanReg)![1];
          let channel = ctx.guild?.channels.get(channelID);

          if (!channel) {
            ctx.reply("Uh oh! I couldn't find the channel you provided.");
            collector.destroy();
            return;
          }

          ctx.commandClient.query(
            `UPDATE servers SET mod_channel = '${channel.id}' WHERE server_id = ${ctx.guildId}`
          );
          attr = `mod logs and set ${channel.mention} as the chat to log to`;
          collector.destroy();
        });

        collector.on('end', () => {
          attr = `mod logs. You did not set a mod log channel. You can set one by doing ${ctx.prefix}set mod log channel #channel`;
        });

        await collector.wait();
        break;
      case 'edits':
      case 'role edits':
        ctx.guild!.flags |= ServerFlags.ROLE_EDITS;
        attr = 'role edits';
        break;
      case 'auto quote':
      case 'auto quotes':
      case 'quotes':
        ctx.guild!.flags |= ServerFlags.AUTO_QUOTE;
        attr = 'auto message quoting';
        break;
      case 'welcomes':
      case 'welcome':
        ctx.guild!.flags |= ServerFlags.WELCOMES;
        attr = 'welcome messages';
        break;
      default:
        break;
    }

    if (!attr) {
      ctx.reply(
        `Usage: ${ctx.prefix}enable {levels/mod logs/role edits/command}`
      );
      return;
    }
    ctx.commandClient
      .query(
        `UPDATE servers SET flags = ${ctx.guild!.flags} WHERE server_id = ${
          ctx.guildId
        }`
      )
      .then(() => {
        ctx.reply(`Enabled ${attr}.`);
      });
  },
};
