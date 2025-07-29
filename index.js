require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const { MessageFlags } = require("discord-api-types/v10");
const { FaucetAccount } = require("./util/wallet");
const { deployCommands } = require("./deploy-commands.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js") && file !== "index.js");

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
    );
  }
}

client.once(Events.ClientReady, async (c) => {
  const addr = await FaucetAccount();
  console.log(
    `Ready! Logged in as ${c.user.tag} with faucet address - ${addr.address}`,
  );
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.channel.name !== process.env.DISCORD_CHANNEL) {
    await interaction.reply({
      content: `This command can only be used in the #${process.env.DISCORD_CHANNEL} channel.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    const errorMessage =
      err.name === "AxiosError"
        ? `\`[Err: ${err.response?.data?.message || "Unknown"}] - A blockchain error occurred!\``
        : `\`${err.message || "An unexpected error occurred."}\``;

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: errorMessage,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await interaction.reply({
        content: errorMessage,
        flags: MessageFlags.Ephemeral,
      });
    }
  }
});

(async () => {
  try {
    await deployCommands();
    client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error("Fatal error during startup:", error);
  }
})();
