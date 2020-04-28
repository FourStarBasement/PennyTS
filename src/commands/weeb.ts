import { Context } from 'detritus-client/lib/command';

interface CommandArgs {
  weeb: string;
}
export const weeb = {
  name: 'weeb',
  arg: {
    name: 'state',
  },
  metadata: {
    description: 'Disables/enables the anime gifs for the hug command.',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    console.log(args);
    if (
      !args.weeb ||
      (args.weeb.toLowerCase() !== 'on' && args.weeb.toLowerCase() !== 'off')
    ) {
      ctx.reply(`Usage: ${ctx.prefix}weeb {on/off}`);
      return;
    }

    if (args.weeb.toLowerCase() === 'on') {
      ctx.commandClient.query(
        `UPDATE \`User\` SET \`weeb\` = 'on' WHERE \`User_ID\` = ${
          ctx.member!.id
        }`
      );
      ctx.reply('You will now receive anime images from the hug command.');
    } else {
      ctx.commandClient.query(
        `UPDATE \`User\` SET \`weeb\` = 'off' WHERE \`User_ID\` = ${
          ctx.member!.id
        }`
      );
      ctx.reply(
        'You will no longer receive anime images from the hug command.'
      );
    }
  },
};
