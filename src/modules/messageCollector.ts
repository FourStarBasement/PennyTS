import { Context } from 'detritus-client/lib/command';
import {
  Message,
  Channel,
  ChannelGuildText,
} from 'detritus-client/lib/structures';
import { ClientEvents } from 'detritus-client/lib/constants';
import { EventEmitter } from 'events';

export class MessageCollector extends EventEmitter {
  ctx: Context;
  timeout: number;
  filter: (...args: Array<Message>) => boolean;
  channel: Channel;
  listener: (m: Message) => boolean;

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
    this.listener = (m: Message) => this.verify(m);
    this.ctx.commandClient.client.on(
      ClientEvents.MESSAGE_CREATE,
      this.listener
    );

    setTimeout(() => {
      this.emit('end');
    }, timeout);

    this.once('end', () => {
      this.destroy();
    });
  }

  destroy() {
    this.ctx.commandClient.client.removeListener(
      ClientEvents.MESSAGE_CREATE,
      this.listener
    );
  }
  // use any type as it returns an object
  verify(m: any) {
    if (this.channel.id !== m.message.channel!.id) return false;
    if (this.filter(m.message)) {
      this.emit('collect', m.message);
      return true;
    }
    return false;
  }
}
