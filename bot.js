require('dotenv').config(); // initialize dotenv
const config = require('./config.json');
const path = require('path');
const fs = require('fs');

const Discord = require('discord.js'); //import discord.js
const client = new Discord.Client(); //create new client

client.on('ready', () => {
  console.log('Logged in as ' + client.user.tag);

  client.user.setActivity('with ur MOM'); // sets playing activity

  client.guilds.cache.forEach((guild) => {
    // info for where the bot is connected
    console.log(guild.name);
    guild.channels.cache.forEach((channel) => {
      console.log(` -- ${channel.name} --- ${channel.type} --- ${channel.id}`);
    });
  });
});

client.on('message', (message) => {
  if (
    message.author.bot || // makes sure bot doesn't answer itself
    !message.content.startsWith(config.prefix) || // makes sure it starts with correct prefix
    !message.guild // makes sure it's connected to a server.
  ) {
    return;
  }

  const args = message.content.slice(config.prefix.length).split(' '); // split the arguments passed
  let command = ''; // use let to and set command = to nothing to catch errors

  if (args[1]) {
    // if there is an argument, then grab our command
    command = args[1].toLowerCase(); //get second argument for command to do
  }

  if (command === 'random') {
    // random function
    randomAudio(message);
  }

  if (command === 'clear') {
    // clear function
    clearMessages(message);
  }

  if (command === 'help') {
    // help trigger and runs the help function
    helpMeSenpai(message);
  } else {

    if (command.length > 0) { // make sure there was an argument passed
      if (command !== 'clear' && command !== 'random') { // play audio as long as it does not equal clear
        audioPlay(message, command);
      }
    } else { // send help message if just !drbofa is passed
      helpMeSenpai(message);
    }
  }
});

function audioPlay(message, file) {
  // play audio function
  const voiceChannel = message.member.voice.channel; // get voicechannel

  if (voiceChannel) {
    // if user is in voicechannel, then we connect and try to play our file
    voiceChannel
      .join()
      .then((connection) => {
        const dispatcher = connection.play(
          path.join(__dirname, '/audio_files/', file + '.mp3'), // get the file to play and run play function on it
          { volume: 0.69 }
        );

        dispatcher.on('speaking', (speaking) => {
          // checks if bot is still speaking, if not, disconnect
          if (!speaking) {
            message.delete().catch(console.error);
            voiceChannel.leave();
          }
        });
      })
      .catch(console.error);
  } else {
    // error for if someone is not in a VC
    message.reply('please join a voice channel first!');
  }
}

function helpMeSenpai(message) {
  // help menu
  const fileList = []; // initialize list
  const filenames = fs.readdirSync(__dirname + '/audio_files/'); // get the filenames for audio files

  filenames.forEach((file) => {
    // loop through each file, strip .mp3, and push to our list
    file = file.replace('.mp3', '');
    fileList.push(file);
  });

  message.channel.send(
    `🚨 🚨 🚨\t**Needing an appointment?**\t🚨 🚨 🚨\n\nTry ***!drbofa*** followed by your symptoms. Try ***!drbofa random*** if you're feeling spicy.\n\n**Currently known ailments:**`
  );
  message.channel.send(` ***\n🔹 ` + fileList.join('\t🔹 ') + `***`); // send fileList formatted to be italizied, and join list with new lines and '-'
}

function clearMessages(message) {
  const channel = message.channel; // TextChannel object
  const messageManager = channel.messages; // MessageManager object

  messageManager
    .fetch({ limit: 100, before: message.id })
    .then((messages) => {
      // fetch the messages
      // `messages` is a Collection of Message objects
      messages.forEach((message) => {
        // look through each message
        let messageBotId = message.author.id === message.guild.me.id; // get bot id for message
        let messageForBot = message.content.includes(config.prefix); // get messages with !drbofa

        if (messageBotId || messageForBot) {
          // if our message contains any of these, delete them
          message.delete();
        }
      });
      message.delete();
      channel.send('Cleanup done!');
    });
}

function randomAudio(message) {
  const fileList = []; // initialize list
  const filenames = fs.readdirSync(__dirname + '/audio_files/'); // get the filenames for audio files

  filenames.forEach((file) => {
    // loop through each file and push to our list
    file = file.replace('.mp3', '').trim();
    fileList.push(file);
  });

  audioPlay(message, fileList[Math.floor(Math.random() * fileList.length)]);
}

// needs to be the last line
client.login(process.env.CLIENT_TOKEN); // login bot using token in dotenv
