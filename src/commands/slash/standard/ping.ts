import { InteractionContext } from 'detritus-client/lib/interaction';

export const ping = {
  description: 'Ping~',
  name: 'ping',
  run: (ctx: InteractionContext) => {
    ctx.editOrRespond('Pong~');
  },
};
