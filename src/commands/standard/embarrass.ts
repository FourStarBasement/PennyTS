import { Context } from 'detritus-client/lib/command';
import { Webhook } from 'detritus-client/lib/structures';
import text from '../modules/embarrass';

export const embarrass = {
  name: 'embarrass',
  metadata: {
    description: 'Yes',
    checks: ['webhooks'],
  },
  run: async (ctx: Context) => {
    ctx.channel
      ?.createWebhook({ name: ctx.member!.name })
      .then(async (hook) => {
        sendMessage(hook, ctx.member!.avatarUrl);
        hook.delete();
      })
      .catch(() => {
        ctx.channel?.fetchWebhooks().then(async (hooks) => {
          hooks[0].delete();
          ctx.channel
            ?.createWebhook({ name: ctx.member!.name })
            .then(async (hook) => {
              sendMessage(hook, ctx.member!.avatarUrl);
              hook.delete();
            });
        });
      });
  },
};

async function sendMessage(hook: Webhook, avatarUrl: string) {
  let content = text.things[Math.floor(Math.random() * text.things.length)];
  return hook.createMessage({
    content: content,
    avatarUrl: avatarUrl,
  });
}
