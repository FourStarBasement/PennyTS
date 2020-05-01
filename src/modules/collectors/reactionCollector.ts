import { EventEmitter } from 'events';
import { Context } from 'detritus-client/lib/command';
import {
  Reaction,
  Channel,
  Message,
  User,
} from 'detritus-client/lib/structures';
import { ClientEvents } from 'detritus-client/lib/constants';
import { GatewayClientEvents } from 'detritus-client';

export class ReactionCollector extends EventEmitter {
  ctx: Context;
  timeout: number;
  filter: (r: Reaction, u: User) => Promise<boolean>;
  listener: (r: GatewayClientEvents.MessageReactionAdd) => boolean;

  constructor(
    ctx: Context,
    timeout: number,
    filter: (r: Reaction, u: User) => Promise<boolean>
  ) {
    super();

    this.ctx = ctx;
    this.timeout = timeout;
    this.filter = filter;
    this.listener = (r: GatewayClientEvents.MessageReactionAdd) =>
      this.verify(r);

    this.ctx.client.on(ClientEvents.MESSAGE_REACTION_ADD, this.listener);

    setTimeout(() => {
      this.emit('end');
    }, timeout);

    this.once('end', () => {
      this.destroy();
    });
  }

  destroy() {
    this.ctx.client.removeListener(
      ClientEvents.MESSAGE_REACTION_ADD,
      this.listener
    );
  }

  verify(r: GatewayClientEvents.MessageReactionAdd) {
    if (this.ctx.channelId !== r.channelId) return false;
    if (this.ctx.me!.id === r.userId) return false;
    if (this.filter(r.reaction, r.user!)) {
      this.emit('collect', r.reaction, r.user!);
      return true;
    }
    return false;
  }
}
