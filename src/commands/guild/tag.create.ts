import { Context } from 'detritus-client/lib/command';
import { stringExtractor } from '../../modules/utils';
import { QueryType } from '../../modules/db';

interface CommandArgs {
  'tag create': string;
}
export const tagCreate = {
  name: 'tag create',
  metadata: {
    description: 'Create/delete/or view info on tags.',
  },
  arg: {
    name: 'tag',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args['tag create']) {
      ctx.reply(
        `Usage: ${ctx.prefix}tag create {tag name (this accepts quotes such as "hey all")} {tag content}`
      );
      return;
    }
    const argument = args['tag create'];

    let name: string = '';
    let quotes: string[] = ['"', "'", '“', '‘'];
    let tagArg = argument.split(' ');
    if (quotes.includes(argument.charAt(0)))
      name = stringExtractor(argument)[0];
    else name = tagArg[0];
    let data = await ctx.commandClient.preparedQuery(
      'SELECT COUNT(*) AS inD FROM tags WHERE guild_id = $1 AND name = $2',
      [ctx.guildId, name],
      QueryType.Single
    );

    if (!data) return;
    if (Number(data.ind) !== 0) {
      ctx.reply('This tag already exists.');
      return;
    }

    if (
      ctx.commandClient.commands.filter((c) => c.name === name.toLowerCase())
        .length > 0
    ) {
      ctx.reply('You cannot make a tag with that name');
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
      'INSERT INTO tags (id, name, owner_id, content, guild_id) VALUES ($1, $2, $3, $4, $5)',
      [Date.now().toString(16), name, ctx.user.id, content, ctx.guildId],
      QueryType.Void
    );
    ctx.reply(`Tag ${name.replace(/@/g, '')} created succesfully.`);
  },
};
