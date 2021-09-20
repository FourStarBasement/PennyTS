import { Context } from 'detritus-client/lib/command';

export const docs = {
  name: 'docs',
  metadata: {
    description: "Penny's documentation",
  },
  aliases: ['github'],
  run: async (context: Context) => {
    context.reply({
      embed: {
        title: "Penny's documentation",
        url: 'https://github.com/Lilwiggy/PennyTS',
        color: 9043849,
        thumbnail: {
          url:
            'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        },
        fields: [
          {
            name: 'Links:',
            value:
              '\n[Repo](https://github.com/Lilwiggy/PennyTS)\n[Commands](https://github.com/Lilwiggy/PennyTS/tree/master/commands)',
          },
        ],
      },
    });
  },
};
