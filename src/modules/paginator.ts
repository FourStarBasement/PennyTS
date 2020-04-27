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
  author: {
    iconUrl?: string;
    name?: string;
    url?: string;
  };
  title: string;
  color: number;
  image: {
    url: string;
  };
  fields?: PageField[];
  footer?: {
    text: string;
    iconUrl?: string;
  };
}

export class Paginator {
  ctx: Context;
  pages: Array<Page>;
  currIndex: number = 0;
  message: Message;

  constructor(ctx: Context, pages: Array<Page>) {
    this.ctx = ctx;
    this.pages = pages;
  }

  async start() {
    let toShow = this.pages[this.currIndex];
    toShow.footer = { text: `Page ${this.currIndex + 1}/${this.pages.length}` };
    this.message = await this.ctx.reply({ embed: toShow });
    this.ctx.commandClient.client.addListener(
      ClientEvents.MESSAGE_REACTION_ADD,
      async (payload: GatewayClientEvents.MessageReactionAdd) => {
        await this.reactionCollector(payload);
      }
    );
    await this.addReactions();
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
    await this.message.delete();
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

  async show() {
    let toShow = this.pages[this.currIndex];
    toShow.footer = { text: `Page ${this.currIndex + 1}/${this.pages.length}` };
    this.message.edit({ embed: toShow });
  }
}
