import { Context } from 'detritus-client/lib/command';
import { stringExtractor } from '../../modules/utils';

interface CommandArgs {
  'tag claim': string;
}
export const tagClaim = {
  name: 'tag claim',
  metadata: {
    description: 'Create/claim/or view info on tags.',
  },
  arg: {
    name: 'tag',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args['tag claim']) {
      ctx.reply(
        `Usage: ${ctx.prefix}tag claim {tag name (this accepts quotes such as "hey all")}`
      );
      return;
    }
    let name: string = '';
    let quotes: string[] = ['"', "'", '“', '‘'];
    let tagArg = args['tag claim'].split(' ');
    if (quotes.includes(args['tag claim'].charAt(0)))
      name = stringExtractor(args['tag claim'])[0];
    else name = tagArg[0];
    // TODO: Prepared statement
    let data = await ctx.commandClient.query(
      `SELECT COUNT(*) AS inD, owner FROM tags WHERE guild = ${ctx.guildId} AND name = '${name}'`
    );
    if (data[0].inD !== 1) {
      ctx.reply('This tag does not exist.');
      return;
    }

    if (ctx.guild?.members.get(data[0].owner)) {
      ctx.reply('The owner of this tag is still in the server.');
      return;
    }
    await ctx.commandClient.query(
      `UPDATE tags SET owner = ${ctx.user.id} WHERE name = '${name}' AND guild = ${ctx.guildId}`
    );
    ctx.reply(
      `You are now the "proud" owner of ${name.replace(/@/g, '')}. Congrats.`
    );
  },
};
