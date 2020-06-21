import { Context } from 'detritus-client/lib/command';
import { stringExtractor } from '../../modules/utils';
import { QueryType } from '../../modules/db';

interface CommandArgs {
  'tag info': string;
}
export const tagInfo = {
  name: 'tag info',
  metadata: {
    description: 'Create/info/or view info on tags.',
    checks: ['embeds'],
  },
  arg: {
    name: 'tag',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args['tag info']) {
      ctx.reply(
        `Usage: ${ctx.prefix}tag info {tag name (this accepts quotes such as "hey all")}`
      );
      return;
    }
    let name: string = '';
    let quotes: string[] = ['"', "'", '“', '‘'];
    let tagArg = args['tag info'].split(' ');
    if (quotes.includes(args['tag info'].charAt(0)))
      name = stringExtractor(args['tag info'])[0];
    else name = tagArg[0];
    let data = await ctx.commandClient.preparedQuery(
      'SELECT COUNT(*) AS inD, ID, used, owner FROM tags WHERE guild = $1 AND name = $2',
      [ctx.guildId, name],
      QueryType.Single
    );
    if (data[0].inD === 0) {
      ctx.reply('This tag does not exist.');
      return;
    }
    let user = ctx.guild?.members.get(data[0].owner);

    if (!user) {
      ctx.reply('The owner of this tag has left the server.');
      return;
    }
    ctx.reply({
      embed: {
        title: `Tag info for ${name}`,
        color: 9043849,
        thumbnail: {
          url: `${user.avatarUrl}?size=2048`,
        },
        fields: [
          {
            name: 'Owner',
            value: user.username,
          },
          {
            name: 'Tag ID',
            value: data[0].ID,
          },
          {
            name: 'Uses',
            value: data[0].used,
          },
        ],
      },
    });
  },
};
