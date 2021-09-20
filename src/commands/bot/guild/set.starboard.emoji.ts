import { Context } from 'detritus-client/lib/command';
import { QueryType } from '../../../modules/db';
import { emojiReg } from '../../../modules/utils';
interface CommandArgs {
  'set starboard emoji': string;
}

export const setStarboardEmoji = {
  name: 'set starboard emoji',
  metadata: {
    description: 'Sets a custom emoji for starboard',
    checks: ['userAdmin'],
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args['set starboard emoji']) {
      ctx.reply(`Usage: ${ctx.prefix}set starboard emoji {emoji}`);
      return;
    }

    let toUpdate: string;
    let em_id = /[0-9]/g;
    if (emojiReg.test(args['set starboard emoji'])) {
      if (!ctx.guild?.emojis.get(ctx.message.content.match(em_id)!.join(''))) {
        ctx.reply('You can only specify custom emotes in this server!');
        return;
      } else {
        toUpdate = ctx.message.content.match(em_id)!.join('');
      }
    } else toUpdate = args['set starboard emoji'];

    ctx.commandClient.preparedQuery(
      'UPDATE servers SET starboard_emoji = $1 WHERE server_id = $2',
      [toUpdate, ctx.guildId!],
      QueryType.Void
    );
    ctx.reply(
      `Successfully set ${args['set starboard emoji']} as the new starboard emoji!.`
    );
  },
};
