import { Context } from 'detritus-client/lib/command';
import config from '../modules/config';
import fetch from 'node-fetch';

export const rabbit = {
  name: 'rabbit',
  run: async (ctx: Context) => {
    if (!ctx.channel?.canAttachFiles) {
      ctx.reply("I don't have permissions to send images in this chat.");
      return;
    }

    let url = `https://api.giphy.com/v1/gifs/search?api_key=${config.giphy.key}&q=rabbit`;
    let res = await fetch(url);
    let json = await res.json();

    let i = Math.floor(Math.random() * json.data.length);
    let img = await fetch(json.data[i].images.original.url).then((r) =>
      r.buffer()
    );

    ctx.reply({
      content: ':rabbit2:',
      file: {
        filename: 'rabbit.gif',
        data: img,
      },
    });
  },
};
