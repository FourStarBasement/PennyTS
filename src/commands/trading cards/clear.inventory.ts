import { Context } from 'detritus-client/lib/command';

export const inventoryClear = {
  name: 'clear inventory',
  metadata: {
    description: 'Show your card inventory',
  },
  run: async (ctx: Context) => {
    await ctx.commandClient.query(
      `DELETE FROM cards WHERE owner_id = '${ctx.userId}'`
    );
    ctx.reply('I cleared your inventory');
  },
};
