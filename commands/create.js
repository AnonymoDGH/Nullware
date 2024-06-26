// Dependencies
const { MessageEmbed, Message } = require('discord.js');
const fs = require('fs');
const config = require('../config.json');
const CatLoggr = require('cat-loggr');

// Functions
const log = new CatLoggr();

module.exports = {
	name: 'create', // Command name
	description: 'Crea un nuevo servicio. ', // Command description

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

        // File path where create the new service file
        const filePath = `${__dirname}/../stock/${args[0]}.txt`;

        // Create new file
        fs.writeFile(filePath, '', function (error) {
            if (error) return log.error(error); // If an error occured, log to console

            message.channel.send(
                new MessageEmbed()
                .setColor(config.color.green)
                .setTitle('¡Servicio creado!')
                .setDescription(`¡Nuevo servicio ${args[0]} creado!`)
                .setFooter(message.author.tag, message.author.displayAvatarURL())
                .setTimestamp()
            );
        });
    }
};
