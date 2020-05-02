import { Context } from 'detritus-client/lib/command';
import {
  Message,
  Channel,
  ChannelGuildText,
} from 'detritus-client/lib/structures';
import { ClientEvents } from 'detritus-client/lib/constants';
import { EventEmitter } from 'events';
import { GatewayClientEvents } from 'detritus-client';

export class MessageCollector extends EventEmitter {
  ctx: Context;
  timeout: number;
  filter: (...args: Array<Message>) => boolean;
  channel: Channel;
  listener: (m: GatewayClientEvents.MessageCreate) => boolean;
  destroyTimeout: NodeJS.Timeout;

  constructor(
    ctx: Context,
    timeout: number,
    filter: (...args: Array<Message>) => boolean
  ) {
    super();
    this.ctx = ctx;
    this.timeout = timeout;
    this.filter = filter;
    (this.channel as ChannelGuildText) = ctx.channel as ChannelGuildText;
    this.listener = (m: GatewayClientEvents.MessageCreate) => this.verify(m);
    this.ctx.client.on(ClientEvents.MESSAGE_CREATE, this.listener);

    this.destroyTimeout = setTimeout(() => {
      this.emit('end');
    }, timeout);

    this.once('end', () => {
      this.destroy();
    });
  }

  destroy() {
    this.ctx.client.removeListener(ClientEvents.MESSAGE_CREATE, this.listener);
    if (this.destroyTimeout) clearTimeout(this.destroyTimeout);
  }

  verify(m: GatewayClientEvents.MessageCreate) {
    if (this.channel.id !== m.message.channel!.id) return false;
    if (this.filter(m.message)) {
      this.emit('collect', m.message);
      return true;
    }
    return false;
  }
}
