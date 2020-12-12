import fs from 'fs';
export interface Card {
  name: string;
  rarity: number;
  series: string;
  //packs?: string[];
}
export enum RARITIES {
  SUPER_COMMON = 100,
  COMMON = 80,
  RARE = 40,
  SUPER_RARE = 20,
  ULTRA_RARE = 10,
  SUPER_ULTRA_RARE = 5,
  IMPOSSIBLE = 1,
}
// ty sharon for helping me understand this
export const RARITY_COLORS: { [index: string]: number } = {
  SUPER_COMMON: 16777214, // Discord won't display FFFFF in an embed :/
  COMMON: 9228799,
  RARE: 6052351,
  SUPER_RARE: 14916863,
  ULTRA_RARE: 16753057,
  SUPER_ULTRA_RARE: 16555454,
  IMPOSSIBLE: 16735324,
};
export function getCards(): Card[] {
  let cards = require('../../src/trading_cards/cards.json');
  return cards as Card[];
}

let saveCards = function (cards: Card[]) {
  fs.writeFile(
    './src/trading_cards/cards.json',
    JSON.stringify(cards, null, 1),
    (er) => {
      if (er) throw new Error(er.stack);

      console.log('Saved cards.json file');
    }
  );
};

export function sortCards(cards: Card[]) {
  let sorted = cards.sort((a, b) => b.rarity - a.rarity);
  saveCards(sorted);
}

export function getCardImage(card: Card): string {
  return `https://penny.wiggy.dev/assets/trading-cards/${(
    card.name.replace(/ /g, '_') +
    '_' +
    card.series.replace(/ /g, '_')
  ).toLowerCase()}.png`;
}

// ty to Ivan for teaching me weighted randomness <3
export function openPack(cards: Card[]): Card[] {
  let picked: Card[] = [];
  let weights: number[] = [];
  let sorted = cards.sort((a, b) => b.rarity - a.rarity);
  sorted.forEach((c: Card) => {
    weights.push(c.rarity);
  });
  let sum = weights.reduce((acc, cur) => acc + cur, 0);
  for (let n = 0; n < 10; n++) {
    let remainder = Math.floor(Math.random() * sum);
    for (let i = 0; i < weights.length; i++) {
      remainder -= weights[i];
      if (remainder < 0) {
        picked.push(sorted[i]);
        break;
      }
    }
  }
  return picked;
}
