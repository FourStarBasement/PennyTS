import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import config from '../../modules/config';

interface CommandArgs {
  wolfjob: string;
}

export const wj = {
  name: 'wolfjob',
  metadata: {
    description: 'Give someone a wolfjob.',
  },
  aliases: ['wj'],
  checks: ['attachments'],
  arg: {
    name: 'wj',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    console.log(args);
    let member =
      ctx.commandClient.fetchGuildMember(ctx)?.avatarUrl ||
      args.wolfjob ||
      ctx.message.attachments.first()?.url ||
      'None';
    if (member === 'None') {
      ctx.reply('Please provide a valid user or image or image URL');
      return;
    }
    const urlReg = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i;

    if (!urlReg.test(member)) {
      ctx.reply('Please use a valid image URL');
      return;
    }

    let img = await fetch(`${config.imageAPI.url}/wolfjob`, {
      headers: {
        image: member!,
        user_avatar: ctx.member!.avatarUrl,
        authorization: config.imageAPI.password,
      },
    })
      .then((d) => d.json())
      .catch(console.error);
    if (img.error) {
      ctx.reply(
        'The image you requested has failed to load. Please try again with a valid image URL.'
      );
      return;
    }
    ctx.reply({
      content: `${ctx.member!.username} just gave a wolfjob.`,
      file: {
        data: Buffer.from(img.buffer),
        filename: 'wolfjob.png',
      },
    });
  },
};
