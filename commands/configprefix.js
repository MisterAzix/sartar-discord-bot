const fs = require('fs');
const config = require('../_data/config.json');

module.exports = {
    name: 'configprefix',
    description: 'Permet de changer le prefix du bot.',
    execute(bot, msg, args) {
        try {
            config.PREFIX = args[0];
            bot.prefix = args[0];
            fs.writeFile('./_data/config.json', JSON.stringify(config), err => {
                if (err) return console.log(err);
                msg.reply(`Le préfix a bien été modifié pour : **${args[0]}**`);
            });
        } catch (e) {
        }
    }
}