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
    let imageURL =
      ctx.commandClient.fetchGuildMember(ctx)?.avatarUrl ||
      args.wolfjob ||
      ctx.message.attachments.first()?.url ||
      'None';
    if (imageURL === 'None') {
      ctx.reply('Please provide a valid user or image or image URL');
      return;
    }
    const urlReg = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i;

    if (!urlReg.test(imageURL)) {
      ctx.reply('Please use a valid image URL');
      return;
    }

    await fetch(`${config.imageAPI.url}/wolfjob?user_image=${ctx.member!.avatarUrl}&target_image=${imageURL}`, {
      headers: {
        Authorization: config.imageAPI.password,
      },
    })
    .then(resp => resp.arrayBuffer())
    .then(buffer => {
      ctx.reply({
        content: `${ctx.member!.username} just gave a wolfjob.`,
        file: {
          data: Buffer.from(buffer),
          filename: 'wolfjob.png',
        },
      });
    })
    .catch(error => {
      console.error(error);
      ctx.reply(
        'The image you requested has failed to load. Please try again with a valid image URL.'
      );
    });
  },
};
