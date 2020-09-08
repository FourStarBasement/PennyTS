import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import config from '../../modules/config';
import { QueryType } from '../../modules/db';

interface CommandArgs {
  'fm add': string;
}
export const fmAdd = {
  name: 'fm add',
  metadata: {
    description: 'Set last.fm info',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args['fm add']) {
      ctx.reply(`Usage: ${ctx.prefix}fm add {last.fm username}`);
      return;
    }

    let data = await fetch(
      `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${args['fm add']}&api_key=${config.lastFM.key}&format=json`
    ).then((d) => d.json());
    if (data.error) {
      if (data.error === 6) {
        ctx.reply('User not found.');
        return;
      }
    }
    await ctx.commandClient.preparedQuery(
      'UPDATE users SET last_fm_name = $1 WHERE user_id = $2',
      [data.recenttracks['@attr'].user, ctx.userId],
      QueryType.Void
    );
    ctx.reply(
      `Updated your last.fm username to ${data.recenttracks['@attr'].user}.`
    );
  },
};
