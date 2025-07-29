const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const millisecondsInHour = 3600000;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "Lists all available commands and provides faucet information.",
    ),
  async execute(interaction) {
    const amount = parseFloat((process.env.AMOUNT / 1000000).toFixed(3));
    const denom = process.env.DENOMINATION;
    const timeoutHours = (process.env.TIMEOUT / millisecondsInHour).toFixed(2);

    const helpEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Help & Faucet Information")
      .setDescription("Here are the commands you can use with this bot:")
      .addFields(
        {
          name: "`/request`",
          value:
            "Request coins through the faucet. Requires an `address` argument.",
        },
        {
          name: "`/faucet_status`",
          value: "Displays the current status of the faucet node.",
        },
        {
          name: "`/faucet_address`",
          value: "Shows the public address of this faucet.",
        },
        {
          name: "`/tx_info`",
          value: "Shows information for a specific `txhash`.",
        },
        {
          name: "`/balance`",
          value: "Shows the balance for a given `address`.",
        },
      )
      .addFields({
        name: "📝 Notes",
        value: `Users are throttled to one request of **${amount} ${denom}** every **${timeoutHours} hours**. Any further requests before the cooldown expires will not be fulfilled.`,
      })
      .addFields({
        name: "⚠️ DISCLAIMER",
        value: `USING THIS FAUCET OR RUNNING A TESTNET NODE DOES NOT ENTITLE YOU TO ANY AIRDROP OR OTHER DISTRIBUTION OF MAINNET ${process.env.CHAIN_NAME.toUpperCase()} TOKENS.`,
      })
      .setFooter({ text: "Created with <3 by 0x4139" });

    await interaction.reply({ embeds: [helpEmbed] });
  },
};
