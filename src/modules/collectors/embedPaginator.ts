import { ReactionCollector } from './reactionCollector';
import { Context } from 'detritus-client/lib/command';
import { Reaction, User, Message } from 'detritus-client/lib/structures';
import { Page } from '../utils';

export class EmbedPaginator {
  ctx: Context;
  message: Message;
  collector: ReactionCollector;
  pages: Page[];
  currIndex: number = 0;
  resetWithin: boolean = false;
  timeout: number = 60000;

  constructor(ctx: Context, pages: Page[]) {
    this.ctx = ctx;
    this.pages = pages;
    this.collector = new ReactionCollector(ctx, 30000, this.message, (r, u) =>
      this.filter(r, u)
    );

    this.collector.on('collect', (r: Reaction, u: User) => {
      switch (r.emoji.name) {
        case '⬅':
          this.back();
          break;

        case '⏹️':
          this.destroy();
          break;

        case '➡':
          this.forward();
          break;

        default:
          break;
      }

      this.resetWithin = true;
      r.delete(u.id);
    });

    this.collector.on('end', () => {
      if (this.resetWithin) {
        this.resetWithin = false;
        setTimeout(() => this.collector.emit('end'), this.timeout);
      } else {
        this.destroy();
      }
    });
  }

  async start() {
    this.message = await this.ctx.reply({ embed: this.prepare() });
    await this.addReactions();
  }

  async back() {
    if (this.currIndex === 0) {
      this.currIndex = this.pages.length - 1;
    } else {
      this.currIndex--;
    }
    this.show();
  }

  async destroy() {
    this.collector.destroy();
    this.message.delete().catch((r) => null);
  }

  async forward() {
    if (this.currIndex === this.pages.length - 1) {
      this.currIndex = 0;
    } else {
      this.currIndex++;
    }
    this.show();
  }

  async addReactions() {
    await this.message.react('⬅');
    await this.message.react('⏹️');
    await this.message.react('➡');
  }

  prepare() {
    let toShow = this.pages[this.currIndex];

    let pageIndicator = `Page ${this.currIndex + 1}/${this.pages.length}`;
    let text = pageIndicator;

    toShow.footer = { text: text };

    return toShow;
  }

  async show() {
    this.message.edit({ embed: this.prepare() });
  }

  filter(r: Reaction, u: User) {
    if (this.ctx.userId !== u?.id) return false;
    return true;
  }
}
