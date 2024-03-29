import { Context } from 'detritus-client/lib/command';
import { stringExtractor } from '../../../modules/utils';
import { QueryType } from '../../../modules/db';

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
      'SELECT id, used, owner_id FROM tags WHERE guild_id = $1 AND name = $2',
      [ctx.guildId, name],
      QueryType.Single
    );

    if (!data) {
      ctx.reply('This tag does not exist.');
      return;
    }

    let user = ctx.guild?.members.get(data.owner_id);

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
            value: data.id,
          },
          {
            name: 'Uses',
            value: data.used,
          },
        ],
      },
    });
  },
};
