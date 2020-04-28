import { Context } from 'detritus-client/lib/command';
import { Embed, EmbedField } from 'detritus-client/lib/utils';
import { Message, Reaction } from 'detritus-client/lib/structures';
import { ClientEvents } from 'detritus-client/lib/constants';
import { GatewayClientEvents } from 'detritus-client/lib/gateway/clientevents';

export interface PageField {
  name: string;
  value: string;
}

export interface Page {
  author?: {
    iconUrl?: string;
    name?: string;
    url?: string;
  };
  thumbnail?: {
    url: string;
  };
  description?: string;
  title?: string;
  color?: number;
  image?: {
    url: string;
  };
  fields?: PageField[];
  footer?: {
    text: string;
    iconUrl?: string;
  };
  url?: string;
}

export class Paginator {
  ctx: Context;
  pages: Array<Page>;
  currIndex: number = 0;
  message: Message;
  idleTimeout: number = 30000; // 30 000 ms | 30 s - When the paginator is first deployed
  timeout: number = 60000; // 60 000 ms | 60 s | 1 m - If a reaction occurs after deployment
  resetWithin: boolean = false;
  footer: string = '';

  constructor(ctx: Context, pages: Array<Page>, footer: string = '') {
    this.ctx = ctx;
    this.pages = pages;
    this.footer = footer;
  }

  async start() {
    this.message = await this.ctx.reply({ embed: this.prepare() });
    this.ctx.commandClient.client.addListener(
      ClientEvents.MESSAGE_REACTION_ADD,
      async (payload: GatewayClientEvents.MessageReactionAdd) => {
        await this.reactionCollector(payload);
      }
    );
    await this.addReactions();
    await this.deleteLoop();
  }

  async deleteLoop(timeout: number = this.idleTimeout) {
    setTimeout(async () => {
      if (this.resetWithin) {
        this.resetWithin = false;
        this.deleteLoop(this.timeout);
      } else {
        this.destroy();
      }
    }, timeout);
  }

  async addReactions() {
    await this.message.react('⬅');
    await this.message.react('⏹️');
    await this.message.react('➡');
  }

  async reactionCollector(payload: GatewayClientEvents.MessageReactionAdd) {
    if (!this.message) {
      return;
    }

    if (payload.userId !== this.ctx.message.author.id) {
      return;
    }

    if (payload.messageId !== this.message.id) {
      return;
    }

    switch (payload.reaction.emoji.name) {
      case '⬅':
        await this.back();
        break;

      case '⏹️':
        await this.destroy();
        break;

      case '➡':
        await this.forward();
        break;

      default:
        break;
    }

    this.resetWithin = true;

    // try delete
    payload.message
      ?.deleteReaction(payload.reaction.emoji.name, payload.userId)
      .catch(() => null);
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
    await this.message.delete().catch(() => null);
    this.ctx.commandClient.client.removeListener(
      ClientEvents.MESSAGE_REACTION_ADD,
      this.reactionCollector
    );
  }

  async forward() {
    if (this.currIndex === this.pages.length - 1) {
      this.currIndex = 0;
    } else {
      this.currIndex++;
    }
    this.show();
  }

  prepare() {
    let toShow = this.pages[this.currIndex];

    let pageIndicator = `Page ${this.currIndex + 1}/${this.pages.length}`;
    let text = pageIndicator;
    if (this.footer) {
      text = `${this.footer} (${pageIndicator})`;
    }

    toShow.footer = { text: text };

    return toShow;
  }

  async show() {
    this.message.edit({ embed: this.prepare() });
  }
}
