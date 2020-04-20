import { CommandOptions, Context } from 'detritus-client/lib/command';

export const avatar = {
  name: 'avatar',
  run: async (context: Context) => {
    let user =
      context.commandClient.fetchGuildMember(context) || context.message.author;
    context.reply({
      embed: {
        title: `${user.username}'s avatar.`,
        image: {
          url: `${user.avatarUrl}?size=2048`,
        },
      },
    });
  },
};
