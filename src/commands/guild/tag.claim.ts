import { Context } from 'detritus-client/lib/command';
import { stringExtractor } from '../../modules/utils';
import { QueryType } from '../../modules/db';

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
    let data = await ctx.commandClient.preparedQuery(
      'SELECT owner_id FROM tags WHERE guild_id = $1 AND name = $2',
      [ctx.guildId, name],
      QueryType.Single
    );

    if (!data) {
      ctx.reply('This tag does not exist.');
      return;
    }

    if (ctx.guild?.members.get(data.owner_id)) {
      ctx.reply('The owner of this tag is still in the server.');
      return;
    }
    await ctx.commandClient.preparedQuery(
      'UPDATE tags SET owner_id = $1 WHERE name = $2 AND guild_id = $3',
      [ctx.user.id, name, ctx.guildId],
      QueryType.Void
    );
    ctx.reply(
      `You are now the "proud" owner of ${name.replace(/@/g, '')}. Congrats.`
    );
  },
};
