import { Context } from 'detritus-client/lib/command';
import { stringExtractor } from '../../modules/utils';

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
    //TODO: Prepared Statement
    let data = await ctx.commandClient.query(
      `SELECT COUNT(*) AS inD, owner FROM tags WHERE guild = ${ctx.guildId} AND name = '${name}'`
    );
    if (data[0].inD !== 1) {
      ctx.reply('This tag does not exist.');
      return;
    }

    if (!ctx.member!.canManageMessages && data[0].owner !== ctx.user.id) {
      ctx.reply('You do not own this tag.');
      return;
    }
    await ctx.commandClient.query(
      `DELETE FROM tags WHERE name = '${name}' AND guild = ${ctx.guildId}`
    );
    ctx.reply(`Tag ${name.replace(/@/g, '')} deleted.`);
  },
};
