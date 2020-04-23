import { Context } from 'detritus-client/lib/command';
import { Member } from 'detritus-client/lib/structures';

export const ban = {
    name: 'ban',
    run: async(ctx: Context) => {
        if (!ctx.member?.canBanMembers) {
            ctx.reply('This command is restricted to server mods.');
            return;
        }
        if (!ctx.me?.canBanMembers) {
            ctx.reply('I cannot ban members!');
            return;
        }
        if (ctx.message.mentions.size < 1) {
            ctx.reply('Please mention a valid user.');
            return;
        }
        if (ctx.message.mentions.first()?.id === ctx.me?.id) {
            ctx.reply('I cannot let you do that.');
            return;
        }
        if (ctx.message.mentions.first()?.id == ctx.message.author.id) {
            ctx.reply('You cannot ban yourself!');
            return;
        }
        if (ctx.me?.highestRole!.position <= (ctx.message.mentions.first()! as Member).highestRole!.position) {
            ctx.reply('I cannot ban this user.');
            return;
        }

        const fetch = require('node-fetch');
        let banImage = undefined;
        
        if (ctx.channel?.canAttachFiles) {
            let img = await fetch('https://i.makeagif.com/media/6-01-2015/yeWyfV.gif');
            img = await img.buffer();
            banImage = {filename: 'ban.gif', data: img};
        }

        ctx.guild?.createBan(ctx.message.mentions.first()!.id, {
            reason: `Action done by ${ctx.user.username}.`
        });
        ctx.reply({
            content: `${ctx.message.mentions.first()?.username} was banned by ${ctx.message.author.username}`,
            file: banImage
        });
    }

}