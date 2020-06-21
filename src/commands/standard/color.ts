import { Context } from 'detritus-client/lib/command';
import fetch from 'node-fetch';
import { Member, Reaction, User } from 'detritus-client/lib/structures';
import { ReactionCollector } from '../../modules/collectors/reactionCollector';
import { DBServer } from '../../modules/db';
import config from '../../modules/config';

interface CommandArgs {
  color: string;
}

export const color = {
  name: 'color',
  metadata: {
    description: "Views your's or someone else's color.",
  },
  arg: {
    name: 'color',
  },
  aliases: ['colour'], // for all you non freedom landers (please don't hurt me NC and seth ily)
  checks: ['attachments'],
  run: async (ctx: Context, args: CommandArgs) => {
    let hex = /^#?[0-9A-F]{6}$/i;
    let user = ctx.commandClient.fetchGuildMember(ctx);
    if (user) {
      ctx.reply(
        `${user.username}'s color is **#${(user as Member).color.toString(
          16
        )}**`
      );
      return;
    }
    let img;
    if (args.color) {
      if (hex.test(args.color)) {
        img = await fetch(`${config.imageAPI.url}/color`, {
          headers: {
            color: args.color,
            authorization: config.imageAPI.password,
          },
        })
          .then((d) => d.json())
          .catch(console.error);
        ctx
          .reply({
            content: `Color for **${args.color}**`,
            file: {
              data: Buffer.from(img.buffer),
              filename: 'color.png',
            },
          })
          .then(async (m) => {
            if (
              !ctx.member!.colorRole ||
              ctx.member!.colorRole!.position >=
              ctx.me!.highestRole!.position ||
              !ctx.me?.canManageRoles
            )
              return;
            let server: DBServer = await ctx.commandClient
              .queryOne(
                `SELECT * FROM servers WHERE server_id = ${ctx.guildId}`
              )
              .catch(console.error);
            await ctx.commandClient
              .query(
                `SELECT * FROM roles WHERE guild = ${
                ctx.guildId
                } AND role = ${ctx.member!.colorRole!.id}`
              )
              .catch((err) => {
                if (err !== 'Query returned nothing') {
                  console.error(err);
                  return;
                }
                if (server.edits === 0) return;
                m.react('📝');

                let filter = (r: Reaction, u: User) => {
                  return r.emoji.name === '📝' && u.id === ctx.member!.id;
                };
                let collector = new ReactionCollector(ctx, 30000, m, filter);
                let old = ctx.member!.colorRole?.color.toString(16);
                collector.on('collect', (r: Reaction, u: User) => {
                  ctx
                    .member!.colorRole?.edit({
                      color: parseInt(`0x${args.color.replace('#', '')}`),
                      reason: `Requested change by ${
                        ctx.member!.username
                        }. Used to be ${old}.`,
                    })
                    .catch(console.error);
                  ctx.reply(`Your role color is now ${args.color}. Enjoy!`);
                  collector.destroy();
                });
              });
          });
      }
    } else {
      ctx.reply(`Your role color is **#${ctx.member!.color.toString(16)}**`);
    }
  },
};
