const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { CosmosGetTxInfo } = require("../util/api");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tx_info")
    .setDescription(
      "Show transaction information for a specific transaction hash.",
    )
    .addStringOption((option) =>
      option
        .setName("txhash")
        .setDescription("The transaction hash to query")
        .setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const txhash = interaction.options.getString("txhash");

    if (!/^([A-Fa-f0-9]{64})$/.test(txhash)) {
      return await interaction.editReply(
        "❌ Invalid transaction hash format. It should be a 64-character hexadecimal string.",
      );
    }

    let txinfo;
    try {
      txinfo = await CosmosGetTxInfo(txhash);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return await interaction.editReply(
          "❌ Transaction not found. Please check the hash and try again.",
        );
      }
      console.error("API error:", error);
      return await interaction.editReply(
        "❌ Failed to fetch transaction data. Please try again later.",
      );
    }

    const formatCoins = (coins) => {
      if (!coins || coins.length === 0) return "N/A";
      return coins.map((c) => `\`${c.amount} ${c.denom}\``).join(", ");
    };

    const message = txinfo.data?.tx?.body?.messages?.[0];
    const fee = txinfo.data?.tx?.auth_info?.fee;

    if (!message) {
      return await interaction.editReply(
        "⚠️ Transaction was found, but message details are missing or unsupported.",
      );
    }

    const txEmbed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Transaction Details")
      .setDescription(`Information for transaction: \`${txhash}\``)
      .addFields(
        { name: "From Address", value: `\`${message.from_address || "N/A"}\`` },
        { name: "To Address", value: `\`${message.to_address || "N/A"}\`` },
        { name: "Amount Transferred", value: formatCoins(message.amount) },
        { name: "Transaction Fee", value: formatCoins(fee?.amount) },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [txEmbed] });
  },
};
