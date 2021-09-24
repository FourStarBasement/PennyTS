import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';

import fs from 'fs';
interface imgs {
  waifu: string[];
  nsfw: string[];
}
export const waifu = {
  name: 'waifu',
  metadata: {
    description: 'Posts a random waifu.',
    checks: ['attachments'],
  },
  run: async (ctx: Context) => {
    if (!ctx.guild?.waifuArr) ctx.guild!.waifuArr = [];

    let emotes: Array<string> = [
      '<:yep:563113732872339456>',
      '<a:wink:667936075024564241>',
      '<:TranceGirlGasm:564557763024388097>',
      '<:blushu:458688271917121537>',
      '<a:abitch_aww:563514404637769728>',
      '<:yeah:506525240986173441>',
      '<:gasm:500019753411411969>',
    ];
    let emote: string = emotes[Math.floor(Math.random() * emotes.length)];
    // console.log(ctx.client.commandClient!.checkImage('https://distribution.faceit-cdn.net/images/617b5e63-b8a7-468c-b60a-131ad21ad34b.jpeg'))
    let images = JSON.parse(
      await fs.promises.readFile('./images.json', 'utf-8')
    );
    let rand = await randomImage(
      ctx.guild!.waifuArr,
      images.waifu,
      0,
      ctx,
      images
    );
    if (rand === 'failed') {
      return; // This will only happen when randomImage fails 3 times in a row
    }

    let img = await fetch(rand).then(async (r) => await r.buffer());
    let split = rand.split('.');
    let ext = split[split.length - 1];
    ctx.reply({
      content: `I approve ${emote}`,
      file: {
        value: img,
        filename: `waifu.${ext.substr(0, 3)}`,
      },
    });
  },
};

async function randomImage(
  arr: Array<string>,
  images: Array<string>,
  failed: number,
  ctx: Context,
  file: imgs
): Promise<string> {
  if (arr.length === 0) {
    ctx.guild!.waifuArr = file.waifu;
    arr = file.waifu;
  }
  shuffle(arr);
  let rand = arr[Math.floor(Math.random() * arr.length)];
  let ran = await ctx.commandClient!.checkImage(rand);
  if (failed === 3) {
    ctx.reply(
      "I failed to get an image 3 times in a row. I'm sorry <:sadness:405061263362752523>"
    );
    return 'failed';
  }
  if (ran === 'failed') {
    failed++;
    file.waifu.splice(images.indexOf(rand), 1);
    await fs.promises.writeFile('./images.json', JSON.stringify(file, null, 2));
    return randomImage(arr, images, failed, ctx, file);
  }
  ctx.guild?.waifuArr.splice(ctx.guild!.waifuArr.indexOf(ran), 1);
  return ran;
}

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
// <3
function shuffle(a: Array<string>) {
  let j;
  let x;
  let i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}
