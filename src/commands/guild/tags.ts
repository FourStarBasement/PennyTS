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
        ? `SELECT * FROM \`tags\` WHERE \`guild\` = ${ctx.guildId}`
        : `SELECT * FROM \`tags\` WHERE \`owner\` = ${user.id} AND \`guild\` = ${ctx.guildId}`;
    let data = await ctx.commandClient.query(query);
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
  tags.forEach((tag: DBTags, i: number) => {
    e.fields?.push({
      name: `${tag.name}    ​   ​`,
      value: `${tag.used} uses.`,
      inline: true,
    });
  });
  return e;
}