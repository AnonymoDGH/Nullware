// Dependencies
const { MessageEmbed, Message, MessageAttachment } = require('discord.js');
const fs = require('fs');
const os = require('os');
const config = require('../config.json');
const CatLoggr = require('cat-loggr');
const https = require('https');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);
const AdmZip = require('adm-zip');
const archiver = require('archiver');

// Functions
const log = new CatLoggr();

module.exports = {
  name: 'tools',
  description: 'Gestionar herramientas',

  execute(message, args) {
    if (message.author.bot) return;

    const subcommand = args[0];
    // ... (Rest of your code)

    if (!subcommand) {
      // Show list of tools
      const toolsDir = `${__dirname}/../tools/`;
      const tools = fs.readdirSync(toolsDir).filter(file => !file.startsWith('.'));

      if (tools.length === 0) {
        return message.reply('No hay herramientas disponibles.');
      }

      let formattedTools = '**Herramientas Disponibles:**\n';

      tools.forEach(tool => {
        const filePath = toolsDir + tool;
        if (fs.statSync(filePath).isDirectory()) {
          formattedTools += `- ${tool} (Directorio)\n`;
        } else {
          formattedTools += `- ${tool} (${getFormattedFileSize(filePath)})\n`;
        }
      });

      message.reply(formattedTools); // Send as a regular message
    // ... (Rest of your code)
      
    } else if (subcommand === 'import') {
      // Import a tool
      let filename = args[1];

      if (!filename) {
        return message.reply('¡Debes especificar un nombre de archivo!');
      }

      // Get the attached file
      const attachment = message.attachments.first();

      if (!attachment) {
        return message.reply('¡Debes adjuntar un archivo!');
      }

      // Automatically add .zip extension if not provided
      if (!filename.endsWith('.zip') && !filename.endsWith('.rar') && !filename.endsWith('.txt')) {
        filename += '.zip'; 
      }

      // Download and handle the file
      const filePath = `${__dirname}/../tools/${filename}`;
      const fileStream = fs.createWriteStream(filePath);

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
            message.channel.send(
              new MessageEmbed()
                .setColor(config.color.green)
                .setTitle('¡Herramienta agregada!')
                .setDescription(`La herramienta ${filename} ha sido importada.`)
                .setFooter(message.author.tag, message.author.displayAvatarURL())
                .setTimestamp()
            );
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
    } else {
      // Handle other subcommands (if needed)
      message.reply('Comando no válido.');
    }
  }
};

// Helper function to format file sizes
function getFormattedFileSize(filePath) {
  const stats = fs.statSync(filePath);
  let fileSizeInBytes = stats.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (fileSizeInBytes >= 1024) {
    fileSizeInBytes /= 1024;
    i++;
  }

  return `${fileSizeInBytes.toFixed(2)} ${sizes[i]}`;
}