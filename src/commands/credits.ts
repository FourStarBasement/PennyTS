import { Context } from 'detritus-client/lib/command';

export const credits = {
  name: 'credits',
  run: async (ctx: Context) => {
    let user = ctx.commandClient.fetchGuildMember(ctx) || ctx.member;
    if (user!.bot) {
      ctx.reply('Silly you! Bots have no use for money.');
      return;
    }
    let data = await ctx.commandClient.query(
      `SELECT \`credits\` FROM \`User\` WHERE \`User_ID\` = ${user!.id}`
    );
    ctx.reply(`💸 ${user?.username} has ${data[0].credits} credits. 💸`);
  },
};
