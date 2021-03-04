import { Context } from 'detritus-client/lib/command';
import { Page } from '../../modules/utils';
import { EmbedPaginator } from '../../modules/collectors/embedPaginator';
import { DBTags } from '../../modules/db';
import { Member } from 'detritus-client/lib/structures';

interface CommandArgs {
  tags: string;
}
export const tags = {
  name: 'tags',
  metadata: {
    description: "Shows a certain user's tags for this server.",
    checks: ['embeds'],
  },
  arg: {
    name: 'tags',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    let user = ctx.commandClient.fetchGuildMember(ctx) || ctx.member!;

    let query: string =
      args.tags === 'all'
        ? `SELECT * FROM tags WHERE guild_id = ${ctx.guildId}`
        : `SELECT * FROM tags WHERE owner_id = ${user.id} AND guild_id = ${ctx.guildId}`;
    let data = await ctx.commandClient.query(query);

    if (data.length == 0) {
      ctx.reply(
        `I could not find any tags ${
          args.tags === 'all'
            ? 'in this server!'
            : 'owned by you, try passing `all` if you want the server tags!'
        } `
      );
      return;
    }

    let pages = new Array<Page>();
    let emotes = new Array<Array<DBTags>>();
    for (let i = 0; i < data.length; i += 6) {
      emotes.push(data.slice(i, i + 6));
    }

    emotes.forEach((emote: Array<DBTags>) => {
      pages.push(embed(ctx, emote));
    });
    new EmbedPaginator(ctx, pages).start();
    return;
  },
};

function embed(ctx: Context, tags: Array<DBTags>): Page {
  let user = (ctx.commandClient.fetchGuildMember(ctx) as Member) || ctx.member!;
  let e: Page = {
    title: `Tags for ${user.username}`,
    thumbnail: {
      url: user.avatarUrl,
    },
    color: user.color,
    fields: [],
  };
  if (ctx.message.content.split(' ')[1] === 'all')
    e = {
      title: `Tags for ${ctx.guild?.name}`,
      thumbnail: {
        url: ctx.guild!.iconUrl!,
      },
      color: ctx.guild?.avgColor,
      fields: [],
    };
  tags.forEach((tag: DBTags, _i: number) => {
    e.fields?.push({
      name: `${tag.name}    ​   ​`,
      value: `${tag.used} uses.`,
      inline: true,
    });
  });
  return e;
}
