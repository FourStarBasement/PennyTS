import { ApplicationCommandOptionTypes } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { DBHighlight, QueryType } from '../../../modules/db';

interface CommandArgs {
  term: string;
}

export const highlightRemove = {
  name: 'highlight-remove',
  description: 'Remove a term from your highlight list',
  disableDm: true,
  options: [
    {
      name: 'term',
      description: 'The word you wish to remove!',
      required: true,
      type: ApplicationCommandOptionTypes.STRING,
    },
  ],
  run: async (ctx: InteractionContext, args: CommandArgs) => {
    let d: DBHighlight[] = await ctx.client.commandClient!.query(
      `SELECT * FROM highlights WHERE user_id = '${ctx.userId}' AND server_id = '${ctx.guildId}'`
    );
    if (d.length === 0) {
      await ctx.client.commandClient!.query(
        `INSERT INTO highlights (server_id, user_id) VALUES ('${ctx.guildId}', '${ctx.userId}')`
      );
      ctx.editOrRespond('You have no words highlighted in this server!');
      return;
    }
    if (d[0].terms && !d[0].terms.includes(args.term)) {
      ctx.editOrRespond('You are not highlighting this term!');
      return;
    }
    await ctx.client
      .commandClient!.preparedQuery(
        'UPDATE highlights SET terms = array_remove(terms, $3) WHERE server_id = $1 AND user_id = $2',
        [ctx.guildId, ctx.userId, args.term],
        QueryType.Void
      )
      .catch(console.error);
    if (!ctx.guild?.highlights) ctx.guild!.highlights = new Map();
    let userCache = ctx.guild?.highlights.get(ctx.userId);
    if (!userCache) {
      ctx.guild?.highlights.set(ctx.userId, []);
      userCache = [];
    }

    userCache?.splice(userCache.indexOf(args.term), 1);
    ctx.guild?.highlights.set(ctx.userId, userCache!);
    ctx.editOrRespond(`Removed ${args.term} from your highlights :)`);
  },
};
