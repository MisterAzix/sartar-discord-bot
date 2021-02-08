module.exports = {
    name: 'help',
    description: 'Pour voir toutes les commandes.',
    execute(bot, msg, args) {
        let message = '';

        bot.commands.forEach(command => {
            message += `**${command.name} :** ${command.description} \n`;
        });
        msg.reply(`Toutes les commandes : \n\n${message}`);
    }
}