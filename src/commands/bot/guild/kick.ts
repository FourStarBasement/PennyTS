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
    let member: Member = ctx.commandClient.fetchGuildMember(ctx) as Member;

    if (!member) {
      ctx.reply('Please provide a valid user!');
      return;
    }

    if (member.id == ctx.me?.id) {
      ctx.reply('I cannot let you do that.');
      return;
    }

    if (member.id == ctx.member!.id) {
      ctx.reply('You cannot kick yourself!');
      return;
    }

    if (ctx.me && ctx.me.highestRole) {
      if (ctx.me.highestRole.position <= member.highestRole!.position) {
        ctx.reply('I cannot kick this user.');
        return;
      }
    }

    let kickImage = undefined;

    if (ctx.channel?.canAttachFiles) {
      let img = await fetch(
        'https://i.giphy.com/media/wOly8pa4s4W88/giphy.gif'
      ).then(async (r) => await r.buffer());
      kickImage = { filename: 'kick.gif', value: img };
    }

    ctx.guild?.removeMember(member.id, {
      reason: `Action done by ${ctx.user.username}.`,
    });

    ctx.reply({
      content: `${member.username} was kicked by ${ctx.member!.username}`,
      file: kickImage,
    });
  },
};
