import { Context } from 'detritus-client/lib/command';
import { User } from '../../modules/db';

export const credits = {
  name: 'credits',
  metadata: {
    description: "View your credits or someone else's credits.",
  },
  run: async (ctx: Context) => {
    let user = ctx.commandClient.fetchGuildMember(ctx) || ctx.member;
    if (user!.bot) {
      ctx.reply('Silly you! Bots have no use for money.');
      return;
    }
    let data: User[] = await ctx.commandClient.query(
      `SELECT \`credits\` FROM \`User\` WHERE \`User_ID\` = ${user!.id}`
    );
    ctx.reply(`💸 ${user?.username} has ${data[0].Credits} credits. 💸`);
  },
};
