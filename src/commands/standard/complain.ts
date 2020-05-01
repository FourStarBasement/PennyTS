import { Context } from 'detritus-client/lib/command';

interface CommandArgs {
  complain: string;
}

export const complain = {
  name: 'complain',
  metadata: {
    description:
      'Complain about Penny.\n"I see all these messages so have fun :)" - Lilwiggy',
  },
  arg: { name: 'complaint' },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args.complain) {
      ctx.reply(`Usage: ${ctx.prefix}complain {complaint}`);
      return;
    }
    ctx.client.channels.get('396008624289349634')?.createMessage({
      embed: {
        title: 'New complaint',
        fields: [
          {
            name: `From ${ctx.member?.username} on ${ctx.guild!.name}`,
            value: `Channel name: ${ctx.channel?.name}\nChannel ID: ${ctx.channelId}\nAuthor ID: ${ctx.member?.id}`,
          },
          {
            name: 'Complaint:',
            value: args.complain,
          },
        ],
        thumbnail: { url: `${ctx.member?.avatarUrl}?size=2048` },
        color: ctx.member?.color,
      },
    });
    ctx.reply(
      'Thank you for you complaint it has been reported to the proper authorities.'
    );
  },
};
