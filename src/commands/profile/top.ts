import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import config from '../../modules/config';
import { DBUser } from '../../modules/db';
import { User } from 'detritus-client/lib/structures';
export const top = {
  name: 'top',
  metadata: {
    description: 'View the top 10 users with the highest levels.',
  },
  aliases: ['leaderboard'],
  checks: ['attachments'],
  run: async (ctx: Context) => {
    let res: DBUser[] = await ctx.commandClient
      .query('SELECT user_id, level, xp, next, flags FROM users ORDER BY level DESC LIMIT 10')
      .catch(console.error);
    let results = res.map(dbUser => {
      const user = ctx.client.users.get(dbUser.user_id.toString());
      return {
        id: user?.id || dbUser.user_id,
        username: user?.username || 'Unknown',
        avatar_url: user?.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png',
        level: dbUser.level,
        xp: dbUser.xp,
        next: dbUser.next,
        flags: dbUser.flags
      }
    });

    await fetch(`${config.imageAPI.url}/leaderboard`, {
      method: 'POST',
      body: JSON.stringify(results),
      headers: {
        'content-type': 'application/json',
        Authorization: config.imageAPI.password,
      },
    })
    .then(resp => resp.arrayBuffer())
    .then(buffer => {
      ctx.reply({
        file: {
          data: Buffer.from(buffer),
          filename: 'leaderboard.png',
        },
      });
    })
    .catch(console.error);
  },
};
