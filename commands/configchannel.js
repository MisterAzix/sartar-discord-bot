const fs = require('fs');
const config = require('../_data/config.json');

module.exports = {
    name: 'configchannel',
    description: 'Permet de changer le de notification de stream.',
    execute(bot, msg, args) {
        try {
            config.NOTIFICATION_CHANNEL_ID = msg.channel.id
            bot.notifChannel = msg.channel.id
            fs.writeFile('./_data/config.json', JSON.stringify(config), err => {
                if (err) return console.log(err);
                msg.reply(`Le channel de notification a bien été modifié !`);
            });
        } catch (e) {
        }
    }
}