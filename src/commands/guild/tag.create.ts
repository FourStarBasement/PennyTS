import { Context } from 'detritus-client/lib/command';
import { stringExtractor } from '../../modules/utils';

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
    let name: string = '';
    let quotes: string[] = ['"', "'", '“', '‘'];
    let tagArg = args['tag create'].split(' ');
    if (quotes.includes(args['tag create'].charAt(0)))
      name = stringExtractor(args['tag create'])[0];
    else name = tagArg[0];
    // TODO: Prepared Statement
    let data = await ctx.commandClient.query(
      `SELECT COUNT(*) AS inD FROM tags WHERE guild = ${ctx.guildId} AND name = '${name}'`
    );
    if (data[0].inD !== 0) {
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
    let content = args['tag create'].split(name)[1].substr(1).trim();
    if (content.length < 1) {
      ctx.reply('You need to include content in a tag.');
      return;
    }
    await ctx.commandClient.query(
      `INSERT INTO tags (guild, ID, owner, name, content) VALUES (${
      ctx.guildId
      }, '${Date.now().toString(16)}', ${ctx.user.id}, '${name}', '${content}')`
    );
    ctx.reply(`Tag ${name.replace(/@/g, '')} created succesfully.`);
  },
};
