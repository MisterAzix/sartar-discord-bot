const fs = require('fs');
const config = require('../_data/config.json');

module.exports = {
    name: 'configstreamer',
    description: 'Permet de changer le streamer a écouter pour les notification de stream.',
    async execute(bot, msg, args) {
        try {
            const user = await bot.apiClient.helix.users.getUserByName(args[0]);
            if (!user) return msg.reply('Streamer inconnu !');
            config.TWITCH_USER_ID = user.id;
            bot.userID = user.id;
            fs.writeFile('./_data/config.json', JSON.stringify(config), err => {
                if (err) return console.log(err);
                msg.reply(`Le streamer à écouter a bien été modifié pour : **${args[0]} (${user.id})**`);
            });
        } catch (e) {
        }
    }
}