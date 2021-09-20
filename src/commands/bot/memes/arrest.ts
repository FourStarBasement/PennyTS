import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import config from '../../../modules/config';

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
    let member =
      ctx.commandClient.fetchGuildMember(ctx)?.avatarUrl ||
      args.arrest ||
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

    let img = await fetch(`${config.imageAPI.url}/arrest`, {
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
      content: `${ctx.member!.username} has arrested someone!`,
      file: {
        value: Buffer.from(img.buffer),
        filename: 'arrest.png',
      },
    });
  },
};
