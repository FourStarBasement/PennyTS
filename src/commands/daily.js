module.exports = {
    name: 'daily',
    run: async(context) => {
        const moment = require('moment');
        let user = context.commandClient.fetchGuildMember(context) || context.message.author;

        if (user.bot) {
            context.reply('Bots have no use for money.');
            return;
        }

        try {
            let res = await context.commandClient.query(`SELECT \`DailyTime\`, \`patron\` FROM \`User\` WHERE \`User_ID\` = '${user.id}'`);
            let amount = Math.floor(Math.random() * (1000 - 500)) + 500;

            if (res[0].patron === 1)
                amount += 500;

            if (res[0].DailyTime === 1) {
                if (user.id === context.message.author.id) {
                    await context.commandClient.query(`UPDATE \`User\` SET \`DailyTime\` = 0,\`Credits\`=\`Credits\` + ${amount} WHERE \`User_ID\` = '${user.id}'`);
                    context.reply(`💸 Here's your ${amount} credits 💸`);
                } else {
                    amount = Math.floor(Math.random() * (2000 - 1000)) + 1000;

                    await context.commandClient.query(`UPDATE \`User\` SET \`Credits\`=\`Credits\` + ${amount} WHERE \`User_ID\` = '${user.id}'`);
                    await context.commandClient.query(`UPDATE \`User\` SET \`DailyTime\` = 0 WHERE \`User_ID\` = '${context.message.author.id}'`);
                    context.reply(`💸 ${context.message.author.username} just gave ${user.username} ${amount} daily credits! 💸`);
                }
            }  else {
                const dur = moment.duration(context.client.job.nextInvocation()._date - Date.now());
                console.log(Date.now());
                context.reply(`Your daily will reset in, ${dur.hours()} hours, ${dur.minutes()} minutes, and ${dur.seconds()} seconds.`);
            }
        } catch (err) {
            console.log(err);
        }
    }
}
