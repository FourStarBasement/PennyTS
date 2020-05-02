import { Context } from 'detritus-client/lib/command';
import config from '../../modules/config';
import fetch from 'node-fetch';

export const parrot = {
  name: 'parrot',
  metadata: {
    description: 'Posts a random parrot! <a:parrotfast:575579320345559040>',
    checks: ['attachments'],
  },
  run: async (ctx: Context) => {
    let url = `https://api.giphy.com/v1/gifs/search?api_key=${config.giphy.key}&q=parrot`;
    let res = await fetch(url);
    let json = await res.json();

    let i = Math.floor(Math.random() * json.data.length);
    let img = await fetch(json.data[i].images.original.url).then((r) =>
      r.buffer()
    );

    ctx.reply({
      content: '<a:partyparrot:393630054321487882>',
      file: {
        filename: 'parrot.gif',
        data: img,
      },
    });
  },
};
