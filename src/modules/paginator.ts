import { Context } from 'detritus-client/lib/command';
import { Embed } from 'detritus-client/lib/utils';
import { Message, Reaction } from 'detritus-client/lib/structures';
import { ClientEvents } from 'detritus-client/lib/constants';
import { GatewayClientEvents } from 'detritus-client/lib/gateway/clientevents';

export class Paginator {
  ctx: Context;
  pages: Array<Embed>;
  currIndex: number = 0;
  message: Message;
  ready: boolean = false;

  constructor(ctx: Context, pages: Array<Embed>) {
    this.ctx = ctx;
    this.pages = pages;
  }

  async start() {
    this.message = await this.ctx.reply({ embed: this.pages[this.currIndex] });
    this.ctx.commandClient.addListener(
      ClientEvents.MESSAGE_REACTION_ADD,
      this.reactionCollector
    );
    await this.addReactions();
  }

  async addReactions() {
    await this.message
      .react('⬅')
      .then(async (r) => await this.message.react('⏹️'))
      .then(async (r) => await this.message.react('➡'));
  }

  async reactionCollector(reaction: GatewayClientEvents.MessageReactionAdd) {
    if (!this.message) {
      return;
    }

    if (reaction.userId !== this.ctx.message.author.id) {
      return;
    }

    if (reaction.messageId !== this.message.id) {
      return;
    }

    console.log(reaction.reaction);

    switch (reaction.reaction.emoji.name) {
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
    this.ctx.commandClient.removeListener(
      ClientEvents.MESSAGE_REACTION_ADD,
      this.reactionCollector
    );
    this.ready = false;
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
    this.message.edit({ embed: this.pages[this.currIndex] });
  }
}
