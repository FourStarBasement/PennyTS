import { Context } from 'detritus-client/lib/command';
import { fetchLastfmUser, LastFMUser } from '../../../modules/utils';
import { User } from 'detritus-client/lib/structures';
import { DBUser } from '../../../modules/db';

interface CommandArgs {
  'fm stats': string;
}
export const fmStats = {
  name: 'fm stats',
  metadata: {
    description: 'Set last.fm info',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    let user: User | string = ctx.commandClient.fetchGuildMember(ctx) as User;
    if (!user && !args['fm stats']) user = ctx.user;
    if (args['fm stats'] && !user) user = args['fm stats'];
    let userFM: LastFMUser;
    if (typeof user === 'string') {
      try {
        userFM = await fetchLastfmUser(user);
      } catch (e) {
        ctx.reply('I could not find that user!');
        return;
      }
    } else {
      let userDB: DBUser = await ctx.commandClient.queryOne(
        `SELECT last_fm_name FROM users WHERE user_id = ${user.id}`
      );
      if (userDB.last_fm_name === null) {
        ctx.reply(
          `${user.username} has not set their last.fm username yet. You can set the last.fm username with ${ctx.prefix}fm add {last.fm username}`
        );
        return;
      }
      userFM = await fetchLastfmUser(userDB.last_fm_name);
    }
    ctx
      .reply({
        embed: {
          title: `${userFM.username}'s last.fm profile`,
          color: await ctx.commandClient.fetchAverageColor(userFM.avatar),
          thumbnail: { url: userFM.avatar },
          description: `**Total scrobbles:** ${userFM.totalPlays}\n**Top track:** ${userFM.topTrack.name} with ${userFM.topTrack.totalPlays} scrobbles\n**Country:** ${userFM.country}`,
        },
      })
      .catch(console.error);
  },
};
