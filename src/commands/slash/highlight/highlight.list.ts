import { InteractionContext } from 'detritus-client/lib/interaction';
import { DBHighlights } from '../../../modules/db';

export const highlightList = {
  name: 'highlight-list',
  description: 'List your highlights',
  disableDm: true,
  run: async (ctx: InteractionContext) => {
    let d: DBHighlights[] = await ctx.client.commandClient!.query(
      `SELECT terms FROM highlights WHERE user_id = '${ctx.userId}' AND server_id = '${ctx.guildId}'`
    );
    if (d.length === 0) {
      ctx.editOrRespond('You have no highlights!');
      return;
    }

    ctx
      .editOrRespond(`Your current highlights: \n${d[0].terms.join('\n')}`)
      .catch(console.error);
  },
};
