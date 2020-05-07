import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
interface images {
  waifu: string[];
  nsfw: string[];
}

import * as images from '../../images.json';
export const nsfw = {
  name: 'nsfw',
  metadata: {
    description: 'Posts a random NSFW image. Only works in NSFW labeled chats.',
    checks: ['nsfw', 'attachments'],
  },
  run: async (ctx: Context) => {
    if (!ctx.guild?.nsfwArr) ctx.guild!.nsfwArr = [];

    // console.log(ctx.client.commandClient!.checkImage('https://distribution.faceit-cdn.net/images/617b5e63-b8a7-468c-b60a-131ad21ad34b.jpeg'))
    let rand = await randomImage(ctx.guild!.nsfwArr, images.nsfw, 0, ctx);
    if (rand === undefined) {
      return; // this should ideally only happen after 3 retries
    }
    let split = rand.split('.');
    let ext = split[split.length - 1];
    let img = await fetch(rand).then(async (r) => await r.buffer());
    ctx.reply({
      file: {
        data: img,
        filename: `nsfw.${ext}`,
      },
    });
  },
};

async function randomImage(
  arr: Array<string>,
  images: Array<string>,
  failed: number,
  ctx: Context
) {
  let ran = await ctx.client.commandClient!.checkImage(
    images[Math.floor(Math.random() * images.length)]
  );
  if (ran === '') {
    if (failed === 3) {
      ctx.reply(
        "I failed to get an image 3 times in a row. I'm sorry <:sadness:405061263362752523>"
      );
      return;
    }
    failed++;
    randomImage(arr, images, failed, ctx);
  }
  if (arr.length === images.length) {
    ctx.guild!.nsfwArr = [];
    return ran;
  } else {
    shuffle(arr);
    if (arr.includes(ran)) {
      randomImage(arr, images, failed, ctx);
    } else {
      arr.push(ran);
      return ran;
    }
  }
  return '';
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
