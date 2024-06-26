// Dependencies
const { MessageEmbed, Message } = require('discord.js');
const fs = require('fs');
const config = require('../config.json');
const CatLoggr = require('cat-loggr');

// Functions
const log = new CatLoggr();

module.exports = {
	name: 'delete', // Command name
	description: 'Elimina un servicio existente. ', // Command description

    /**
     * Command exetute
     * @param {Message} message The message sent by user
     * @param {Array[]} args Arguments splitted by spaces after the command name
     */
	execute(message, args) {
        // Parameters
        const service = args[0];

        // If the "service" parameter is missing
        if (!service) {
            return message.channel.send(
                new MessageEmbed()
                .setColor(config.color.red)
                .setTitle('<:JrAdmin:1251730796176474132> ¡Faltan parámetros!')
                .setDescription('¡Necesitas dar un nombre de servicio!')
                .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                .setTimestamp()
            );
        };

        // File path where the service file is located
        const filePath = `${__dirname}/../stock/${args[0]}.txt`;

        // Delete the file
        fs.unlink(filePath, function (error) {
            if (error) {
                if (error.code === 'ENOENT') {
                    // File does not exist
                    return message.channel.send(
                        new MessageEmbed()
                        .setColor(config.color.red)
                        .setTitle('<:JrAdmin:1251730796176474132> ¡Servicio no encontrado!')
                        .setDescription(`¡El servicio ${args[0]} no existe!`)
                        .setFooter(message.author.tag, message.author.displayAvatarURL())
                        .setTimestamp()
                    );
                } else {
                    // Other error
                    return log.error(error); 
                }
            }

            message.channel.send(
                new MessageEmbed()
                .setColor(config.color.green)
                .setTitle('¡Servicio eliminado!')
                .setDescription(`¡Servicio ${args[0]} eliminado!`)
                .setFooter(message.author.tag, message.author.displayAvatarURL())
                .setTimestamp()
            );
        });
    }
};