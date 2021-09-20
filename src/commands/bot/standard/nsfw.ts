import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import fs from 'fs';
interface imgs {
  waifu: string[];
  nsfw: string[];
}

export const nsfw = {
  name: 'nsfw',
  metadata: {
    description: 'Posts a random NSFW image. Only works in NSFW labeled chats.',
    checks: ['nsfw', 'attachments'],
  },
  run: async (ctx: Context) => {
    if (!ctx.guild?.nsfwArr) ctx.guild!.nsfwArr = [];

    // console.log(ctx.client.commandClient!.checkImage('https://distribution.faceit-cdn.net/images/617b5e63-b8a7-468c-b60a-131ad21ad34b.jpeg'))
    let images = JSON.parse(
      await fs.promises.readFile('./images.json', 'utf-8')
    );
    let rand = await randomImage(
      ctx.guild!.nsfwArr,
      images.nsfw,
      0,
      ctx,
      images
    );
    if (rand === 'failed') {
      return; // this should ideally only happen after 3 retries
    }
    let split = rand.split('.');
    let ext = split[split.length - 1];
    let img = await fetch(rand).then(async (r) => await r.buffer());
    ctx.reply({
      file: {
        value: img,
        filename: `nsfw.${ext.substr(0, 3)}`,
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
    ctx.guild!.nsfwArr = file.nsfw;
    arr = file.nsfw;
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
    file.nsfw.splice(images.indexOf(rand), 1);
    await fs.promises.writeFile('./images.json', JSON.stringify(file, null, 2));
    return randomImage(arr, images, failed, ctx, file);
  }
  ctx.guild?.nsfwArr.splice(ctx.guild!.nsfwArr.indexOf(ran), 1);
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
