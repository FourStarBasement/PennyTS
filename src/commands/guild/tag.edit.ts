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
    let name: string = '';
    let quotes: string[] = ['"', "'", '“', '‘'];
    let tagArg = args['tag edit'].split(' ');
    if (quotes.includes(args['tag edit'].charAt(0)))
      name = stringExtractor(args['tag edit'])[0];
    else name = tagArg[0];
    let data = await ctx.commandClient.preparedQuery(
      'SELECT COUNT(*) AS inD, owner, content FROM tags WHERE guild = $1 AND name = $2',
      [ctx.guildId, name],
      QueryType.Single
    );
    if (data[0].inD === 0) {
      ctx.reply('This tag does not exist.');
      return;
    }
    if (data[0].owner !== ctx.user.id) {
      ctx.reply('You do not own this tag.');
      return;
    }
    let content = args['tag edit'].split(name)[1].substr(1).trim();
    if (content.length < 1) {
      ctx.reply('You need to include content in a tag.');
      return;
    }
    await ctx.commandClient.preparedQuery(
      'UPDATE tags SET content = $1 WHERE guild = $2 AND name = $3',
      [content, ctx.guildId, name],
      QueryType.Void
    );
    ctx.reply(`Tag ${name.replace(/@/g, '')} edited succesfully.`);
  },
};
