import { Context } from 'detritus-client/lib/command';

interface CommandArgs {
  delete: number;
}

export const delete_cmd = {
  name: 'delete',
  arg: { name: 'amount', default: undefined, type: Number },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!ctx.member?.canManageMessages) {
      ctx.reply('This command is restricted to server mods.');
      return;
    }

    if (!ctx.me?.canManageMessages) {
      ctx.reply('I cannot delete messages in this chat.');
      return;
    }

    if (!args.delete) {
      ctx.reply(`Usage: ${ctx.prefix}delete {amount of messages to delete}`);
      return;
    }

    if (args.delete < 1) {
      ctx.reply('The amount must be positive.');
      return;
    }

    let del = args.delete == 1 ? 2 : args.delete;

    if (del > 100) {
      ctx.reply('Max amount is 100.');
      return;
    }

    ctx.message.delete().then(async () => {
      let messages = await ctx.channel?.fetchMessages({
        limit: del,
      });
      if (!messages) {
        ctx.reply('An error occurred whilst trying to delete the messages.');
        return;
      }

      let ids = Array.from(messages.keys());
      ctx.channel?.bulkDelete(ids).catch(console.error);
      ctx.reply(`Deleted ${args.delete} messages.`).then((m) => {
        setTimeout(() => m.delete(), 4000);
      });
    });
  },
};
