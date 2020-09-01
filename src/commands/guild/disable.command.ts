import { Context } from 'detritus-client/lib/command';
import { User, Reaction } from 'detritus-client/lib/structures';
import { ReactionCollector } from '../../modules/collectors/reactionCollector';
import { QueryType } from '../../modules/db';

interface CommandArgs {
  'disable command': string;
}

export const disableCommand = {
  name: 'disable command',
  aliases: ['enabled command'],
  metadata: {
    description: 'Disables or enables commands.',
    checks: ['userAdmin'],
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args['disable command']) {
      ctx.reply(
        `Usage: ${ctx.prefix}disable command {command to disable} Doing ${ctx.prefix}disable command tags will disable tag usage.`
      );
      return;
    }
    if (args['disable command'].toLowerCase() === 'disable command') {
      ctx.reply(
        'You cannot disable this command. How else to you expect to enable commands :p'
      );
      return;
    }
    let cmd = ctx.commandClient.commands.find(
      (command) => command.name === args['disable command'].toLowerCase()
    );

    if (!cmd) {
      ctx.reply('I could not find that command!');
      return;
    }
    if (!cmd.metadata.disabled) cmd.metadata.disabled = [];
    let msg = await ctx.reply({
      embed: {
        title: `Where do you want to disable/enable the ${args['disable command']} command from?`,
        description: `\`\`\`ini\n[1] This server\n[2] This channel\`\`\``,
      },
    });
    let emojis = ['1️⃣', '2️⃣', '⏹️'];
    await msg.react('1️⃣');
    await msg.react('2️⃣');
    await msg.react('⏹️');

    let filter = (r: Reaction, u: User) => {
      return emojis.includes(r.emoji.name) && u.id === ctx.userId;
    };
    let col = new ReactionCollector(ctx, 10000, msg, filter);
    col.on('collect', async (r: Reaction, u: User) => {
      let toUpdate = '';
      switch (r.emoji.name) {
        case '1️⃣':
          toUpdate = 'server_id';
          break;
        case '2️⃣':
          toUpdate = 'channel_id';
          break;
        case '⏹️':
          col.destroy();
          msg.edit({
            embed: {
              title: 'Cancelled',
              description: '```diff\n- Action cancelled.```',
            },
          });
          break;
      }
      col.destroy();
      let data = await ctx.commandClient.preparedQuery(
        `SELECT COUNT(*) AS count FROM disabled_commands WHERE ${toUpdate} = $1 AND command = $2`,
        [
          toUpdate === 'server_id' ? ctx.guildId : ctx.channelId,
          args['disable command'].toLowerCase(),
        ],
        QueryType.Single
      );
      if (data.count > 0) {
        await ctx.commandClient.preparedQuery(
          `DELETE FROM disabled_commands WHERE command = $1 AND ${toUpdate} = $2`,
          [
            args['disable command'],
            toUpdate === 'server_id' ? ctx.guildId : ctx.channelId,
          ],
          QueryType.Void
        );
        cmd!.metadata.disabled.splice(
          cmd!.metadata.disabled.indexOf(
            toUpdate === 'server_id' ? ctx.guildId : ctx.channelId
          ),
          1
        );
        msg.edit({
          embed: {
            title: 'Done!',
            description: `\`\`\`diff\n+ Successfully enabled the ${args['disable command']} command.\`\`\``,
          },
        });
      } else {
        await ctx.commandClient.preparedQuery(
          `INSERT INTO disabled_commands (command, ${toUpdate}) VALUES($1, $2)`,
          [
            args['disable command'].toLowerCase(),
            toUpdate === 'server_id' ? ctx.guildId : ctx.channelId,
          ],
          QueryType.Void
        );
        cmd!.metadata.disabled.push(
          toUpdate === 'server_id' ? ctx.guildId : ctx.channelId
        );
        msg.edit({
          embed: {
            title: 'Done!',
            description: `\`\`\`diff\n- Successfully disabled the ${args['disable command']} command.\`\`\``,
          },
        });
      }
    });
  },
};
