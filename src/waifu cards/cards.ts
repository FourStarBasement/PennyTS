export interface Card {
  name: string;
  rarity: number;
  series: string;
}

export const cards: Record<number, Card> = {
  1: {
    name: 'Miu Iruma',
    rarity: 80,
    series: 'Danganronpa',
  },
  2: {
    name: 'Mirei Mikagura',
    rarity: 90,
    series: 'Digimon',
  },
  3: {
    name: 'Corrin',
    rarity: 60,
    series: 'Fire Emblem',
  },
  4: {
    name: 'Kasandra',
    rarity: 70,
    series: 'Xenoblade Chronicles',
  },
  5: {
    name: 'Mamako Oosuki',
    rarity: 30,
    series: 'Okaasan Online',
  },
  6: {
    name: 'Angie Yonaga',
    rarity: 90,
    series: 'Danganronpa',
  },
  7: {
    name: 'Komi San',
    rarity: 5,
    series: 'Komi-san wa Komyushou Desu',
  },
};
