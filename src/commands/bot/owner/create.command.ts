import { Context, CommandOptions } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import config from '../../../modules/config';

export const createCommand: CommandOptions = {
  name: 'create command',
  metadata: {
    description: 'Steal an emoji!',
    options: [],
  },
  run: async (ctx: Context) => {
    let body = {
      name: 'color',
      description: "Get a user's color or check a color value",
      options: [],
    };
    let d = await fetch(
      'https://discord.com/api/v8/applications/700883795397574657/guilds/151760749918683137/commands',
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          Authorization: `Bot ${config.token}`,
          'Content-Type': 'application/json',
        },
      }
    )
      .then((res) => {
        return res.json();
      })
      .catch(console.error);
    /*let d = await fetch(
      'https://discord.com/api/v8/applications/700883795397574657/guilds/309531752014151690/commands',
      {
        method: 'get',
        //body: JSON.stringify(body),
        headers: {
          Authorization: `Bot ${config.token}`,
        },
      }
    )
      .then((res) => {
        return res.json();
        console.log(res);
      })
      .catch(console.error);*/
    console.log(d);
    ctx.reply('Command made');
  },
};
