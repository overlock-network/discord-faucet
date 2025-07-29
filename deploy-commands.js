require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

async function deployCommands() {
  const commands = [];
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js") && file !== "index.js");

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    }
  }

  const rest = new REST().setToken(process.env.DISCORD_TOKEN);

  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    );

    const data = await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID,
        process.env.DISCORD_GUILD_ID,
      ),
      { body: commands },
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (error) {
    console.error("Failed to deploy commands:", error);
  }
}

module.exports = {
  deployCommands,
};
