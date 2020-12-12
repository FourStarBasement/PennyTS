import { Context } from 'detritus-client/lib/command';
import {
  Card,
  getCardImage,
  getCards,
  RARITIES,
  RARITY_COLORS,
} from '../../trading_cards/cards';
import { DBCard } from '../../modules/db';
import { Page } from '../../modules/utils';
import { EmbedPaginator } from '../../modules/collectors/embedPaginator';

export const inventory = {
  name: 'inventory',
  metadata: {
    description: 'Show your card inventory',
    checks: ['embeds'],
  },
  run: async (ctx: Context) => {
    let data: DBCard[] = await ctx.commandClient.query(
      `SELECT * FROM cards WHERE owner_id = ${ctx.userId}`
    );
    if (!data || data.length < 1) {
      ctx.reply('You have no cards!');
      return;
    }
    let allCards: Page[] = [];
    data
      .sort((a, b) => {
        let card1 = fetchCard(a);
        let card2 = fetchCard(b);
        return card1.rarity - card2.rarity;
      })
      .forEach((c: DBCard) => {
        let card = fetchCard(c);
        allCards.push(embed(card, c));
      });
    new EmbedPaginator(ctx, allCards).start();
    return;
  },
};

function embed(card: Card, dbCard: DBCard): Page {
  return {
    title: `${card.name} (${dbCard.count} owned)`,
    color: RARITY_COLORS[RARITIES[card.rarity]],
    image: {
      url: getCardImage(card),
    },
    fields: [
      {
        name: 'Rarity',
        value: `${card.rarity}/100`,
      },
      {
        name: 'Series',
        value: card.series,
      },
    ],
  };
}

function fetchCard(card: DBCard): Card {
  let cards = getCards();
  return cards.find((c: Card) => {
    return (
      c.name.replace(/ /g, '_').toLowerCase() +
        '_' +
        c.series.replace(/ /g, '_').toLowerCase() ===
      card.card_id
    );
  })!;
}
