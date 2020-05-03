import { Context } from 'detritus-client/lib/command';
import { Message } from 'detritus-client/lib/structures';
import { MessageCollector } from '../../modules/collectors/messageCollector';
import { chanReg } from '../../modules/utils';

interface CommandArgs {
  enable: string;
}

export const enable = {
  name: 'enable',
  metadata: {
    description: 'Enables mod logs, levels, or role edits',
    checks: ['userAdmin'],
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args.enable) {
      ctx.reply(`Usage: ${ctx.prefix}enable [levels/mod logs/role edits]`);
    } else if (args.enable === 'levels') {
      ctx.commandClient
        .query(
          `UPDATE \`Servers\` SET \`levels\` = 1 WHERE \`ServerID\` = ${ctx.guildId}`
        )
        .then(() => {
          ctx.reply('Enabled levels.');
        });
    } else if (args.enable === 'mod logs') {
      ctx.commandClient.query(
        `UPDATE \`Servers\` SET \`mod_log\` = 1 WHERE \`ServerID\` = ${ctx.guildId}`
      );
      ctx.reply('Please mention the chat for logs:');
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
          `UPDATE \`Servers\` SET \`mod_channel\` = '${channel.id}' WHERE \`ServerID\` = '${ctx.guildId}'`
        );
        ctx.reply(
          `Enabled mod logs and set ${channel.mention} as the mod channel.`
        );
        collector.destroy();
      });

      collector.on('end', () => {
        ctx.reply(
          `You did not set a mod log channel. You can set one by doing ${ctx.prefix}set mod channel #channel`
        );
      });
    } else if (args.enable === 'edits') {
      ctx.commandClient.query(
        `UPDATE \`Servers\` SET \`edits\` = 1 WHERE \`ServerID\` = '${ctx.guildId}'`
      );
      ctx.reply('Enabled role edits.');
    } else {
      ctx.reply(`Usage: ${ctx.prefix}enable [levels/mod logs/role edits]`);
    }
  },
};
