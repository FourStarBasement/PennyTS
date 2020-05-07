import { Context } from 'detritus-client/lib/command';
import { stringExtractor } from '../../modules/utils';

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
    let data = await ctx.commandClient.query(
      `SELECT COUNT(*) AS inD, \`owner\`, \`content\` FROM \`tags\` WHERE \`guild\` = ${ctx.guildId} AND \`name\` = '${name}'`
    );
    if (data[0].inD === 0) {
      ctx.reply('This tag does not exist.');
      return;
    }
    if (data[0].owner !== ctx.user.id) {
      ctx.reply('You do not own this tag.');
      return;
    }
    // +3 cause spaces and such
    let content = args['tag edit'].substr(name.length + 3);
    if (content.length < 1) {
      ctx.reply('You need to include content in a tag.');
      return;
    }
    await ctx.commandClient.query(
      `UPDATE \`tags\` SET \`content\` = '${content}' WHERE \`guild\` = ${ctx.guildId} AND \`name\` = '${name}'`
    );
    ctx.reply(`Tag ${name.replace(/@/g, '')} edited succesfully.`);
  },
};
