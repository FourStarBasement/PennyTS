import { InteractionContext } from 'detritus-client/lib/interaction';

export const highlightList = {
  name: 'highlight-list',
  description: 'List your highlights',
  disableDm: true,
  run: async (ctx: InteractionContext) => {
    let userCache = ctx.guild!.highlights.get(ctx.userId);
    if (userCache!.length < 1) {
      ctx.editOrRespond('You have no highlights!');
      return;
    }
    ctx
      .editOrRespond(`Your current highlights: \n${userCache!.join('\n')}`)
      .catch(console.error);
  },
};
