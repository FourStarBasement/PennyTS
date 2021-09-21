import { ApplicationCommandOptionTypes } from 'detritus-client/lib/constants';
import { InteractionContext } from 'detritus-client/lib/interaction';
import { DBHighlights, QueryType } from '../../../modules/db';

interface CommandArgs {
  term: string;
}

export const highlightAdd = {
  name: 'highlight-add',
  description: 'Add to your list of highlights!',
  disableDm: true,
  options: [
    {
      name: 'term',
      description: 'The word you wish to highlight!',
      required: true,
      type: ApplicationCommandOptionTypes.STRING,
    },
  ],
  run: async (ctx: InteractionContext, args: CommandArgs) => {
    if (args.term.length < 2) {
      ctx.editOrRespond(
        'This term is too short! Please pick a work greater than 2 characters.'
      );
      return;
    }
    let d: DBHighlights[] = await ctx.client.commandClient!.query(
      `SELECT * FROM highlights WHERE user_id = '${ctx.userId}' AND server_id = '${ctx.guildId}'`
    );
    if (d.length === 0)
      await ctx.client.commandClient!.query(
        `INSERT INTO highlights (server_id, user_id) VALUES ('${ctx.guildId}', '${ctx.userId}')`
      );

    if (d[0].terms && d[0].terms.includes(args.term.toLowerCase())) {
      ctx.editOrRespond('You are already highlighting this term!');
      return;
    }
    await ctx.client
      .commandClient!.preparedQuery(
        'UPDATE highlights SET terms = array_append(terms, $3) WHERE server_id = $1 AND user_id = $2',
        [ctx.guildId, ctx.userId, args.term.toLowerCase()],
        QueryType.Void
      )
      .catch(console.error);
    let userCache = ctx.guild?.highlights.get(ctx.userId);
    if (!userCache) ctx.guild?.highlights.set(ctx.userId, []);

    userCache?.push(args.term.toLowerCase());
    ctx.guild?.highlights.set(ctx.userId, userCache!);
    if (!ctx.guild?.terms.includes(args.term.toLowerCase()))
      ctx.guild?.terms.push(args.term.toLowerCase());
    ctx.editOrRespond(`Added ${args.term} to your highlights :)`);
  },
};
