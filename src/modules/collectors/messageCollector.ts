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

    this.once('end', () => {
      this.destroy();
    });
  }

  // Starts a message collector, does not block or wait for the result.
  start() {
    this.ctx.client.on(ClientEvents.MESSAGE_CREATE, this.listener);

    this.destroyTimeout = setTimeout(() => {
      this.emit('end');
    }, this.timeout);
  }

  // Starts a message collector, blocks until a result is returned.
  wait() {
    return new Promise((resolve, reject) => {
      this.listener = (m: GatewayClientEvents.MessageCreate) => {
        const flag = this.verify(m);
        if (flag)
          resolve(m);

        return flag;
      };

      this.ctx.client.on(ClientEvents.MESSAGE_CREATE, this.listener);

      this.destroyTimeout = setTimeout(() => {
        reject();
        this.emit('end');
      }, this.timeout);
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
