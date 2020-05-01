import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import config from '../modules/config';

interface CommandArgs {
  osu: string;
}
export const osu = {
  name: 'osu',
  arg: {
    name: 'user',
  },
  metadata: {
    description: "Shows a player's osu! stats.",
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args.osu) {
      ctx.reply('Please provide a valid osu! username.');
      return;
    }
    let data = await fetch(
      `https://osu.ppy.sh/api/get_user?u=${args.osu}&k=${config.osu.token}`
    ).then((d) => d.json());
    if (!data[0]) {
      ctx.reply('I could not find that user.');
      return;
    }
    const embed = {
      title: `Profile stats for ${data[0].username}`,
      color: 9043849,
      url: `https://osu.ppy.sh/u/${data[0].user_id}`,
      thumbnail: { url: `https://a.ppy.sh/${data[0].user_id}` },
      fields: [
        {
          name: 'Username',
          value: data[0].username,
          inline: true,
        },
        {
          name: 'Rank',
          value: data[0].pp_rank,
          inline: true,
        },
        {
          name: 'Level',
          value: Math.floor(data[0].level),
          inline: true,
        },
        {
          name: 'Country',
          value: data[0].country,
          inline: true,
        },
        {
          name: 'Country Rank',
          value: data[0].pp_country_rank,
          inline: true,
        },
        {
          name: 'pp',
          value: Math.floor(data[0].pp_raw),
          inline: true,
        },
        {
          name: 'Total score',
          value: Math.floor(data[0].total_score),
          inline: true,
        },
        {
          name: 'Ranked score',
          value: Math.floor(data[0].ranked_score),
          inline: true,
        },
        {
          name: 'Accuracy',
          value: `${Math.floor(data[0].accuracy)}%`,
          inline: true,
        },
      ],
    };

    ctx.reply({
      embed: embed,
    });
  },
};
