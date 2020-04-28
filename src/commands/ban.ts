import { Context } from 'detritus-client/lib/command';
import { Member } from 'detritus-client/lib/structures';
import fetch from 'node-fetch';

export const ban = {
  name: 'ban',
  metadata: {
    description: 'Ban a user.',
    checks: ['ban'],
  },
  run: async (ctx: Context) => {
    if (ctx.message.mentions.size < 1) {
      ctx.reply('Please mention a valid user.');
      return;
    }
    if (ctx.message.mentions.first()?.id === ctx.me?.id) {
      ctx.reply('I cannot let you do that.');
      return;
    }
    if (ctx.message.mentions.first()?.id == ctx.message.author.id) {
      ctx.reply('You cannot ban yourself!');
      return;
    }
    if (
      ctx.me?.highestRole!.position <=
      (ctx.message.mentions.first()! as Member).highestRole!.position
    ) {
      ctx.reply('I cannot ban this user.');
      return;
    }

    let banImage = undefined;

    if (ctx.channel?.canAttachFiles) {
      let img = await fetch(
        'https://i.makeagif.com/media/6-01-2015/yeWyfV.gif'
      ).then(async (r) => await r.buffer());
      banImage = { filename: 'ban.gif', data: img };
    }

    ctx.guild?.createBan!(ctx.message.mentions.first()!.id, {
      reason: `Action done by ${ctx.user.username}.`,
    });
    ctx.reply({
      content: `${ctx.message.mentions.first()?.username} was banned by ${
        ctx.message.author.username
      }`,
      file: banImage,
    });
  },
};
