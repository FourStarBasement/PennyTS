import { Context } from 'detritus-client/lib/command';

interface CommandArgs {
  tag: string;
}
export const tag = {
  name: 'tag',
  metadata: {
    description: 'Create/delete/or view info on tags.',
    checks: ['embed'],
  },
  arg: {
    name: 'tag',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args.tag) {
      ctx.reply(
        `Usage: ${ctx.prefix}tag {create/edit/info/vars/delete/claim}\nExample tag usage: ${ctx.prefix}hello`
      );
    }
    if (args.tag === 'vars' || args.tag === 'variables') {
      ctx.reply({
        embed: {
          title: 'Tag variables',
          color: 9043849,
          author: {
            name: 'PennyBot',
            iconUrl: ctx.me?.avatarUrl,
          },
          fields: [
            {
              name: 'User vars',
              value:
                "{username} - The message author's username\n{mentions.username} - The username of the first person mentioned.\nThis can accept any type of member resolvable data when using the tag. (User ID, username, mention)",
            },
          ],
        },
      });
    }
  },
};
