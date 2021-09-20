import { Context } from 'detritus-client/lib/command';
import { Message } from 'detritus-client/lib/structures';
import { MessageCollector } from '../../modules/collectors/messageCollector';
import { Card, getCards, sortCards } from '../../trading_cards/cards';
import fetch from 'node-fetch';
import fs from 'fs';
let i = 0;
export const cardCreate = {
  name: 'card create',
  metadata: {
    description: 'Buy and open card packs!',
  },
  run: async (ctx: Context) => {
    if (ctx.userId !== '232614905533038593') {
      ctx.reply('No.');
      return;
    }
    let names = ``;
    ctx.reply(
      `What image do I add for ${names.split('\n')[i]} which has a rarity of`
    );
    createCard(ctx, names.split('\n'));
  },
};
let cards = getCards();
function createCard(ctx: Context, names: string[]) {
  if (i === names.length) {
    ctx.reply('I am done');
    return;
  }
  let image = '';
  let filter = (m: Message) => {
    return m.author.id === ctx.userId;
  };
  let col = new MessageCollector(ctx, 120000000, filter);
  let s = names[i].split('-');
  let name = s[0].trim();
  let rarity = parseInt(s[1]);
  let series = '';
  let json: Card = {
    name: name,
    rarity: rarity,
    series: series,
  };
  if (i !== 0) {
    ctx.reply(
      `What image do I add for ${name} which has a rarity of ${rarity}`
    );
  }
  col.on('collect', (m: Message) => {
    image = m.content;
    fetch(image).then((res) => {
      let dest = fs.createWriteStream(
        `./src/trading_cards/${name
          .toLowerCase()
          .replace(' ', '_')}_${series.toLowerCase().replace(' ', '_')}.png`
      );
      res.body.pipe(dest);
    });
    ctx.reply(
      `So ${name} is from ${series} and has a rarity of ${rarity} and the image is ${image}`
    );
    i++;
    cards.push(json);
    sortCards(cards);
    col.destroy();
    createCard(ctx, names);
  });
}

/* */
