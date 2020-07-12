import { Context } from 'detritus-client/lib/command';
import { stringExtractor } from '../../modules/utils';
import { QueryType } from '../../modules/db';

interface CommandArgs {
  'tag edit': string;
}
export const tagEdit = {
  name: 'tag edit',
  metadata: {
    description: 'Create/delete/or view info on tags.',
  },
  arg: {
    name: 'tag',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args['tag edit']) {
      ctx.reply(
        `Usage: ${ctx.prefix}tag edit {tag name (this accepts quotes such as "hey all")} {tag content}`
      );
      return;
    }
    let argument = args['tag edit'];
    let name: string = '';
    let quotes: string[] = ['"', "'", '“', '‘'];
    let tagArg = argument.split(' ');
    if (quotes.includes(argument.charAt(0)))
      name = stringExtractor(argument)[0];
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

    if (data.owner_id !== ctx.user.id) {
      ctx.reply('You do not own this tag.');
      return;
    }

    let content = argument;
    if (quotes.includes(argument.charAt(0)))
      content = argument.slice(name.length + 2).trim();
    else
      content = argument.slice(name.length).trim();

    if (content.length < 1) {
      ctx.reply('You need to include content in a tag.');
      return;
    }
    await ctx.commandClient.preparedQuery(
      'UPDATE tags SET content = $1 WHERE guild_id = $2 AND name = $3',
      [content, ctx.guildId, name],
      QueryType.Void
    );
    ctx.reply(`Tag ${name.replace(/@/g, '')} edited succesfully.`);
  },
};
