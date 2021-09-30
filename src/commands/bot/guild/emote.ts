import { Context } from 'detritus-client/lib/command';
import { Page } from '../../../modules/utils';
import { EmbedPaginator } from '../../../modules/collectors/embedPaginator';
import { DBEmote } from '../../../modules/db';

interface CommandArgs {
  emote: string;
}

export const emote = {
  name: 'emote',
  metadata: {
    description: 'Shows how many times an emote has been used.',
    checks: ['embeds'],
  },
  run: async (ctx: Context, args: CommandArgs) => {
    const em = /<a?:\w+:\d+>/g;

    if (!args.emote) {
      ctx.reply(`Usage: ${ctx.prefix}emote {all/emote}`);
      return;
    }

    if (em.test(args.emote)) {
      const em_id = /[0-9]/g;
      const r = ctx.message.content.match(em_id)!.join('');
      let data;
      if (ctx.guild?.emojis.get(r.substr(0, 18))) {
        data = await ctx.commandClient
          .query(
            `SELECT * FROM emote WHERE server_id = ${
              ctx.guildId
            } AND emote_id = ${r.substr(0, 18)}`
          )
          .catch((e) => {
            if (e === 'Query returned nothing') {
              ctx.reply('This emote has not been used.');
              return;
            }
          });
      } else if (ctx.guild?.emojis.get(r)) {
        data = await ctx.commandClient
          .query(
            `SELECT * FROM emote WHERE server_id = ${ctx.guildId} AND emote_id = ${r}`
          )
          .catch((e) => {
            if (e === 'Query returned nothing') {
              ctx.reply('This emote has not been used.');
              return;
            }
          });
      } else {
        ctx.reply('That emote is not in this server');
        return;
      }

      if (!data) ctx.reply('This emote has not been used.');
      ctx.reply(`That emote has been used ${data[0].used} times.`);
    } else if (args.emote.toLowerCase() === 'all') {
      if (ctx.guild!.emojis.length < 1) {
        ctx.reply("This server doesn't have any emojis!");
        return;
      }
      let data: DBEmote[] = await ctx.commandClient.query(
        `SELECT * FROM emote WHERE server_id = ${ctx.guildId}`
      );
      if (ctx.guild!.emojis.length < 1 || data.length < 1) {
        ctx.reply("This server doesn't have any emojis!");
        return;
      }
      data.sort((a: DBEmote, b: DBEmote) => b.used - a.used);

      // TODO: review.
      let pages: Page[] = [];
      let emotes: DBEmote[][] = [];
      for (let i = 0; i < data.length; i += 5) {
        emotes.push(data.slice(i, i + 5));
      }

      emotes.forEach((emote: Array<DBEmote>) => {
        pages.push(embed(ctx, emote));
      });
      new EmbedPaginator(ctx, pages).start();
      return;
    } else {
      ctx.reply(`Please use a custom emoji or ${ctx.prefix}emote all`);
      return;
    }
  },
};

function embed(ctx: Context, emotes: Array<DBEmote>): Page {
  let e: Page = {
    title: `Emoji stats for ${ctx.guild!.name}.`,
    author: {
      iconUrl: ctx.me!.avatarUrl,
    },
    fields: [],
    color: 9043849,
  };
  emotes.forEach(async (em) => {
    if (!ctx.guild?.emojis.get(em.emote_id.toString())) {
      await ctx.commandClient.query(
        `DELETE FROM emote WHERE emote_id = ${em.emote_id}`
      );
      return;
    }
    e.fields?.push({
      name: `${
        ctx.guild?.emojis.get(em.emote_id.toString())?.name
      }: ${ctx.guild?.emojis.get(em.emote_id.toString())}`,
      value: `Used: ${em.used}`,
    });
  });
  return e;
}
