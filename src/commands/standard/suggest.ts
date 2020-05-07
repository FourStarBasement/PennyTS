import { Context } from 'detritus-client/lib/command';

interface CommandArgs {
  suggest: string;
}
interface images {
  waifu: string[];
  nsfw: string[];
}

import * as images from '../../images.json';
import {
  Reaction,
  User,
  ChannelGuildText,
  Message,
} from 'detritus-client/lib/structures';
import { ReactionCollector } from '../../modules/collectors/reactionCollector';
import fs from 'fs';
export const suggest = {
  name: 'suggest',
  metadata: {
    description: 'Suggest a waifu or an NSFW image to Penny.',
  },
  arg: {
    name: 'suggest',
  },
  run: async (ctx: Context, args: CommandArgs) => {
    if (!args.suggest) {
      ctx.reply(`Usage: ${ctx.prefix}suggest {nsfw/waifu} {direct image URL}`);
      return;
    }
    const urlReg = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/i;
    let suggestImage = args.suggest.split(' ');
    let waifu: boolean = true;
    if (!suggestImage[1]) {
      ctx.reply(`Usage: ${ctx.prefix}suggest {nsfw/waifu} {direct image URL}`);
      return;
    }
    if (!urlReg.test(suggestImage[1])) {
      ctx.reply(
        'Please provide a direct image URL. Example:\n<https://i.redditmedia.com/FFyOQVvnqRHrh5mdvIlSkPkgwyKewh0kNTrfTGkKCB8.jpg?s=78f3642d9310340fcc61c90f1537f9a5>\nor, <https://i.imgur.com/uyiWv1h.jpg>'
      );
      return;
    }

    if (suggestImage[0].toLowerCase() === 'nsfw') waifu = false;

    ctx.reply(
      'Thank you for your suggestion. I will let you know if your image is selected.'
    );
    let channel: ChannelGuildText;
    if (waifu)
      channel = ctx.client.channels.get(
        '452955996629762058'
      ) as ChannelGuildText;
    else
      channel = ctx.client.channels.get(
        '452969186763866113'
      ) as ChannelGuildText;

    channel
      .createMessage({
        embed: {
          title: `New ${waifu ? 'waifu' : 'nsfw'} suggestion`,
          color: 16729927,
          image: {
            url: suggestImage[1],
          },
          fields: [
            {
              name: `User: ${ctx.user}\n${ctx.userId}`,
              value: `Message ID: ${ctx.message.id}`,
            },
          ],
        },
      })
      .then(async (m: Message) => {
        await m.react('✅');
        await m.react('🗑');
        const filter = (r: Reaction, u: User) => {
          return (
            (r.emoji.name === '✅' || r.emoji.name === '🗑') &&
            u.id === '232614905533038593'
          );
        };
        let col = new ReactionCollector(ctx, 8.64e7, m, filter);
        col.on('collect', (r: Reaction, u: User) => {
          if (r.emoji.name === '✅') {
            if (images[waifu ? 'waifu' : 'nsfw'].includes(suggestImage[1])) {
              m.edit({
                embed: {
                  title: 'Duplicate entry',
                  color: 16328487,
                  image: {
                    url: suggestImage[1],
                  },
                },
              });
              ctx.member
                ?.createMessage(
                  `Your ${
                    waifu ? 'waifu' : 'nsfw'
                  } image was a duplicate entry. Sorry about that.`
                )
                .catch(() => {
                  ctx.reply(
                    `${ctx.member?.mention} your ${
                      waifu ? 'waifu' : 'nsfw'
                    } image was a duplicate entry. Sorry about that.`
                  );
                });
            } else {
              images[waifu ? 'waifu' : 'nsfw'].push(suggestImage[1]);
              fs.writeFile(
                './images.json',
                JSON.stringify(images, null, 2),
                (er) => {
                  if (er) console.log(er);
                  m.edit({
                    embed: {
                      title: `Added ${waifu ? 'waifu' : 'nsfw'}`,
                      color: 8386943,
                      image: {
                        url: suggestImage[1],
                      },
                    },
                  });

                  ctx.member
                    ?.createMessage(
                      `Your ${
                        waifu ? 'waifu' : 'nsfw'
                      } image was added! Keep your eye out for it.`
                    )
                    .catch(() => {
                      ctx.reply(
                        `Your ${
                          waifu ? 'waifu' : 'nsfw'
                        } image was added! Keep your eye out for it.`
                      );
                    });
                }
              );
            }
          } else {
            m.edit({
              embed: {
                title: `Deleted ${waifu ? 'waifu' : 'nsfw'}`,
                color: 14038839,
                image: {
                  url: suggestImage[1],
                },
              },
            });

            ctx.member
              ?.createMessage(
                `Your ${waifu ? 'waifu' : 'nsfw'} image was denied.`
              )
              .catch(() => {
                ctx.reply(`Your ${waifu ? 'waifu' : 'nsfw'} image was denied.`);
              });
          }
        });
      });
  },
};
