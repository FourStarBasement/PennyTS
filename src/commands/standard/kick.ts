import { Context } from 'detritus-client/lib/command';
import { Member } from 'detritus-client/lib/structures';
import fetch from 'node-fetch';

export const kick = {
  name: 'kick',
  metadata: {
    description: 'Kick a user.',
    checks: ['kick'],
  },
  run: async (ctx: Context) => {
    if (ctx.message.mentions.size < 1) {
      ctx.reply('Please mention a valid user.');
      return;
    }

    let mention = ctx.message.mentions.first()!;

    if (mention.id == ctx.me?.id) {
      ctx.reply('I cannot let you do that.');
      return;
    }

    if (mention.id == ctx.member!.id) {
      ctx.reply('You cannot kick yourself!');
      return;
    }

    if (
      ctx.me?.highestRole!.position <= (mention as Member).highestRole!.position
    ) {
      ctx.reply('I cannot kick this user.');
      return;
    }

    let kickImage = undefined;

    if (ctx.channel?.canAttachFiles) {
      let img = await fetch(
        'https://i.giphy.com/media/wOly8pa4s4W88/giphy.gif'
      ).then(async (r) => await r.buffer());
      kickImage = { filename: 'kick.gif', data: img };
    }

    ctx.guild?.removeMember(mention.id, {
      reason: `Action done by ${ctx.user.username}.`,
    });

    ctx.reply({
      content: `${mention.username} was kicked by ${ctx.member!.username}`,
      file: kickImage,
    });
  },
};
