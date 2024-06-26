// Dependencies
const { MessageEmbed, Message } = require('discord.js');
const fs = require('fs');
const config = require('../config.json');
const { promisify } = require('util');
const readdir = promisify(fs.readdir); // Use promisify for async/await

module.exports = {
  name: 'stock', // Command name
  description: 'Mostrar el stock de servicios.', // Command description

  /**
   * Command execute
   * @param {Message} message The message sent by user
   */
  async execute(message) {
    // Arrays
    const stock = [];

    try {
      // Read all of the services
      const files = await readdir(`${__dirname}/../stock/`);

      // Put services into the stock
      files.forEach(function (file) {
        if (!file.endsWith('.txt')) return;
        stock.push(file);
      });

      const embed = new MessageEmbed()
        .setColor(config.color.default)
        .setTitle(`<:Ater2:1251728834957414482> _${stock.length}_ **servicios!**`)
        .setDescription('');

      // Push all services to the stock
      for (const data of stock) {
        const acc = fs.readFileSync(`${__dirname}/../stock/${data}`, 'utf-8');
        const lines = acc.split(/\r?\n/).filter(line => line.trim() !== ''); // Filter out empty lines

        // Update embed description message
        embed.description += `**${data.replace('.txt', '')}:** \n stock:\`${lines.length}\`\n`;
      }

      message.channel.send(embed);
    } catch (err) {
      console.log('Unable to scan directory:', err);
      message.channel.send(
        new MessageEmbed()
          .setColor(config.color.red)
          .setTitle('¡Error!')
          .setDescription('Hubo un error al leer el stock de servicios.')
          .setFooter(message.author.tag, message.author.displayAvatarURL())
          .setTimestamp()
      );
    }
  }
};