import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import images from '../images';

declare module 'detritus-client/lib/structures/guild' {
  interface Guild {
    waifuArr: Array<string>;
    nsfwArr: Array<string>;
    prefix: string;
    levels: number;
  }
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
    let rand = await randomImage(ctx.guild!.waifuArr, images.waifu, 0, ctx);
    if (rand === undefined) {
      return; // this should ideally only happen after 3 retries
    }

    let img = await fetch(rand).then(async (r) => await r.buffer());
    ctx.reply({
      content: `I approve ${emote}`,
      file: {
        data: img,
        filename: 'waifu.png',
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
    ctx.guild!.waifuArr = [];
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
