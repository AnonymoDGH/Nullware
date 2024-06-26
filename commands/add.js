// Dependencies
const { MessageEmbed, Message, MessageAttachment } = require('discord.js');
const fs = require('fs');
const os = require('os');
const config = require('../config.json');
const CatLoggr = require('cat-loggr');
const https = require('https'); // Import for HTTPS requests
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline); // For efficient file download

// Functions
const log = new CatLoggr();

module.exports = {
  name: 'add', // Command name (can be different from the file name)
  description: 'Agregar una cuenta a un servicio.', // Command description displays in the help command

  /**
   * Command execute
   * @param {Message} message The message sent by user
   * @param {Array} args Arguments splitted by spaces after the command name
   */
  execute(message, args) {
    // Parameters
    const service = args[0];

    // If the "service" parameter is missing
    if (!service) {
      return message.channel.send(
        new MessageEmbed()
          .setColor(config.color.red)
          .setTitle('¡Faltan parámetros!')
          .setDescription('¡Necesitas especificar un servicio!')
          .addField('Por ejemplo', `${config.prefix}${this.name} **tree** <archivo.txt>`)
          .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
          .setTimestamp()
      );
    }

    // Get the attached file
    const attachment = message.attachments.first();

    if (!attachment) {
      return message.channel.send(
        new MessageEmbed()
          .setColor(config.color.red)
          .setTitle('¡Faltan parámetros!')
          .setDescription('¡Debes adjuntar un archivo TXT con las cuentas!')
          .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
          .setTimestamp()
      );
    }

    // Download the attached file using HTTPS
    const filePath = `${__dirname}/../stock/${service}.txt`;
    const fileStream = fs.createWriteStream(filePath, { flags: 'a' }); // 'a' flag for appending
    https.get(attachment.url, (response) => {
      if (response.statusCode !== 200) {
        fileStream.destroy();
        return message.channel.send(
          new MessageEmbed()
            .setColor(config.color.red)
            .setTitle('¡Error!')
            .setDescription('Hubo un error al descargar el archivo. Intenta nuevamente.')
            .setFooter(message.author.tag, message.author.displayAvatarURL())
            .setTimestamp()
        );
      }

      pipeline(response, fileStream)
        .then(() => {
          // Append new content (using the attachment URL as a new line)
          fs.appendFileSync(filePath, '\n' + attachment.url);

          message.channel.send(
            new MessageEmbed()
              .setColor(config.color.green)
              .setTitle('¡Cuentas agregadas!')
              .setDescription(`Se agregaron las cuentas al servicio ${service}!`)
              .setFooter(message.author.tag, message.author.displayAvatarURL())
              .setTimestamp()
          ).then(message => message.delete({ timeout: 5000 })); // Automatically delete the message after 5 seconds
        })
        .catch((error) => {
          log.error(error);
          message.channel.send(
            new MessageEmbed()
              .setColor(config.color.red)
              .setTitle('¡Error!')
              .setDescription('Hubo un error al guardar el archivo. Intenta nuevamente.')
              .setFooter(message.author.tag, message.author.displayAvatarURL())
              .setTimestamp()
          );
        });
    }).on('error', (error) => {
      log.error(error);
      message.channel.send(
        new MessageEmbed()
          .setColor(config.color.red)
          .setTitle('¡Error!')
          .setDescription('Hubo un error al descargar el archivo. Intenta nuevamente.')
          .setFooter(message.author.tag, message.author.displayAvatarURL())
          .setTimestamp()
      );
    });
  }
};