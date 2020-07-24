import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import images from '../../modules/images';
import { DBUser, UserFlags } from '../../modules/db';

let canHugWiggy = [
  '407773762814083072', // Elferton
  '197850690247327744', // Ashurie
  '310839399728545792', // Matza
  '600058196249411587', // Batthew's dummy thicc cheeks like holy fuck they're so thicc
  '411710271229526017', // Bats cause she wants to be nice
  '357763197559767041', // Glowwy cause 😳😳😳
];

export const hug = {
  name: 'hug',
  metadata: {
    description: 'Hug a user',
  },
  run: async (ctx: Context) => {
    let image: string;
    let lols = images.hugs.lolNo;
    let hugsAnime = images.hugs.anime;
    let hugsReal = images.hugs.noAnime;
    let user = ctx.commandClient.fetchGuildMember(ctx);

    if (!user) {
      ctx.reply('Please mention a valid user.');
      return;
    }

    if (user.id === ctx.member?.id) {
      ctx.reply("You can't hug yourself! That's just weird:/");
      return;
    }

    if (user.bot) {
      if (user.id === ctx.me!.id) {
        ctx.reply({
          content: `${ctx.member!.username} just gave me a hug! <3`,
          file: {
            value: await fetch(
              'https://cdn.discordapp.com/attachments/289898558898044928/518528032156287036/Penny_tackle_hugs_Ruby.gif'
            ).then((d) => d.buffer()),
            filename: 'hug.gif',
          },
        });
        return;
      } else {
        ctx.reply("Silly you! Bots don't have emotions!");
        return;
      }
    }

    let data: DBUser = await ctx.commandClient.queryOne(
      `SELECT flags FROM users WHERE user_id = ${user.id}`
    );

    if (user.id === '232614905533038593') {
      if (!canHugWiggy.includes(ctx.member!.id)) {
        image = lols[Math.floor(Math.random() * lols.length)];
        ctx.reply({
          content: `${
            ctx.member!.username
          } just tried to hug Lilwiggy. Yeah that didn't work.`,
          file: {
            value: await fetch(image).then((d) => d.buffer()),
            filename: 'hug.gif',
          },
        });
        return;
      }
    }
    if (data && ctx.commandClient.hasFlag(data.flags, UserFlags.Weeb))
      image = hugsAnime[Math.floor(Math.random() * hugsAnime.length)];
    else image = hugsReal[Math.floor(Math.random() * hugsReal.length)];

    ctx.reply({
      content: `${ctx.member!.username} just gave ${user.username} a hug!`,
      file: {
        value: await fetch(image).then((d) => d.buffer()),
        filename: 'hug.gif',
      },
    });
  },
};
