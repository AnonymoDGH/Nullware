// Dependencies
const Discord = require('discord.js');
const { ModalBuilder, TextInputBuilder, TextInputStyle, Client, GatewayIntentBits, MessageEmbed, Activity, ActivityType, SlashCommandBuilder, Collection, Events, Intents, MessageActionRow, MessageButton, Interaction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');
const CatLoggr = require('cat-loggr');
const AdmZip = require('adm-zip');
const archiver = require('archiver');

// Functions
const client = new Discord.Client();
const log = new CatLoggr();

// New discord collections
client.commands = new Discord.Collection();

// Logging
if (config.debug === true) client.on('debug', stream => log.debug(stream)); // if debug is enabled in config
client.on('warn', message => log.warn(message));
client.on('error', error => log.error(error));

// Load commands from folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js')); // Command directory
for (const file of commandFiles) {
  const command = require(`./commands/${file}`); // Load the command
    log.init(`Loaded command ${file.split('.')[0] === command.name ? file.split('.')[0] : `${file.split('.')[0]} as ${command.name}`}`); // Logging to console
  client.commands.set(command.name, command); // Set command by name to the discord "commands" collection
};

// Client login
client.login('');

client.once('ready', () => {
  log.info(`I am logged in as ${client.user.tag} to Discord!`); // Say hello to console
    client.user.setActivity(`${config.prefix}gen • ${client.user.username.toUpperCase()}`, { type: "WATCHING" }); // Set the bot's activity status
    /* You can change the activity type to:
     * LISTENING
     * WATCHING
     * COMPETING
     * STREAMING (you need to add a twitch.tv url next to type like this:   { type: "STREAMING", url: "https://twitch.tv/twitch_username_here"} )
     * PLAYING (default)
    */
});

// Discord message event and command handling
client.on('message', (message) => {
  if (!message.content.startsWith(config.prefix)) return; // If the message does not start with the prefix 
  if (message.author.bot) return; // If a command executed by a bot

    // Split message content to arguments
  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

    // If the command does not exists
  if (config.command.notfound_message === true && !client.commands.has(command)) {
        return message.channel.send(
            new Discord.MessageEmbed()
            .setColor(config.color.red)
            .setTitle('<:JrAdmin:1251730796176474132> Comando desconocido :(')
            .setDescription(`Lo siento, pero no puedo encontrar el comando \`${command}\`.`)
            .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
            .setTimestamp()
        );
    };

    // Executing the command
  try {
    client.commands.get(command).execute(message, args); // Execute
  } catch (error) {
    log.error(error); // Logging if error

        // Send error messsage if the "error_message" field is "true" in the configuration
    if (config.command.error_message === true) {
            message.channel.send(
                new Discord.MessageEmbed()
                .setColor(config.color.red)
                .setTitle('<:Expadmin:1251730879659643002> ¡Se produjo un error! <:Expadmin:1251730879659643002>')
                .setDescription(`¡Ocurrió un error al ejecutar el comando \`${command}\`!`)
                .addField('Error', `\`\`\`js\n${error}\n\`\`\``)
                .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                .setTimestamp()
            );
        };
  };
});
