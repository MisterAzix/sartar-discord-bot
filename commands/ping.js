module.exports = {
    name: 'ping',
    description: 'Répond simplement pong!',
    execute(bot, msg, args) {
        msg.reply('pong');
    }
}