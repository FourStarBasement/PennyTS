import { Context } from 'detritus-client/lib/command';
import { stringExtractor } from '../../../modules/utils';
import { QueryType } from '../../../modules/db';

interface CommandArgs {
  'tag delete': string;
}
export const tagDelete = {
  name: 'tag delete',
  metadata: {
    description: 'Create/delete/or view info on tags.',
  },
  arg: {
    name: 'tag',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args['tag delete']) {
      ctx.reply(
        `Usage: ${ctx.prefix}tag delete {tag name (this accepts quotes such as "hey all")}`
      );
      return;
    }
    let name: string = '';
    let quotes: string[] = ['"', "'", '“', '‘'];
    let tagArg = args['tag delete'].split(' ');
    if (quotes.includes(args['tag delete'].charAt(0)))
      name = stringExtractor(args['tag delete'])[0];
    else name = tagArg[0];
    let data = await ctx.commandClient.preparedQuery(
      'SELECT owner_id FROM tags WHERE guild_id = $1 AND name = $2',
      [ctx.guildId, name],
      QueryType.Single
    );

    if (!data) {
      ctx.reply('This tag does not exist.');
      return;
    }

    if (!ctx.member!.canManageMessages && data.owner_id !== ctx.user.id) {
      ctx.reply('You do not own this tag.');
      return;
    }
    await ctx.commandClient.preparedQuery(
      'DELETE FROM tags WHERE name = $1 AND guild_id = $2',
      [name, ctx.guildId],
      QueryType.Void
    );
    ctx.reply(`Tag ${name.replace(/@/g, '')} deleted.`);
  },
};
