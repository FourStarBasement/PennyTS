import { Context } from 'detritus-client/lib/command';
import { cards, Card } from '../../trading cards/cards';
//import { fetchRandomNumber } from '../../modules/utils';

export const cardClaim = {
  name: 'card claim',
  metadata: {
    description: 'Claim a card!',
  },
  run: async (ctx: Context) => {
    let weights: number[] = [];
    let sorted = cards.sort((a, b) => b.rarity - a.rarity);
    sorted.forEach((c: Card) => {
      weights.push(c.rarity);
    });
    let sum = weights.reduce((acc, cur) => acc + cur, 0);
    let selected: string[] = [];
    let picked = new Map();

    //console.log(((await fetchRandomNumber()) / sum) * cards.length);
    for (let n = 0; n < 10; n++) {
      let remainder = Math.floor(Math.random() * sum);
      for (let i = 0; i < weights.length; i++) {
        remainder -= weights[i];
        if (remainder < 0) {
          selected.push(
            `${sorted[i].name} from ${sorted[i].series} which has a rarity of ${sorted[i].rarity}/100`
          );
          picked.set(sorted[i].name, picked.get(sorted[i].name) + 1 || 1);
          break;
        }
      }
    }
    //console.log(picked);
    ctx.reply(selected.join('\n'));
  },
};
