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
      .query('SELECT * FROM `User` ORDER BY `Level` DESC LIMIT 10')
      .catch(console.error);
    let users: Array<User | string> = [];
    for (let i = 0; i < 10; i++) {
      users.push(ctx.client.users.get(res[i].User_ID) || 'Unknown');
    }

    let img = await fetch(`${config.imageAPI.url}/leaderboard`, {
      headers: {
        json: JSON.stringify({
          query: res,
          users: users,
        }),
      },
    })
      .then((d) => d.json())
      .catch(console.error);
    ctx.reply({
      file: {
        data: Buffer.from(img.buffer),
        filename: 'leaderboard.png',
      },
    });
  },
};
