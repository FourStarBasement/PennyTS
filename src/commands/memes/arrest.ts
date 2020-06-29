import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import config from '../../modules/config';

interface CommandArgs {
  arrest: string;
}

export const arrest = {
  name: 'arrest',
  metadata: {
    description: 'Arrest someone.',
  },
  aliases: ['deport'],
  checks: ['attachments'],
  arg: {
    name: 'arrest',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    let imageURL =
      ctx.commandClient.fetchGuildMember(ctx)?.avatarUrl ||
      args.arrest ||
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

    await fetch(`${config.imageAPI.url}/arrest?user_image=${ctx.member!.avatarUrl}&target_image=${imageURL}`, {
      headers: {
        Authorization: config.imageAPI.password
      },
    })
    .then(resp => resp.arrayBuffer())
    .then(buffer => {
      ctx.reply({
        content: `${ctx.member!.username} has arrested someone!`,
        file: {
          data: Buffer.from(buffer),
          filename: 'arrest.png',
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
