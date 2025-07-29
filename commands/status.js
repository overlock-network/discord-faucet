const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { CosmosGetNodeStatus, CosmosGetBalance } = require("../util/api");
const { FaucetAccount: FaucetWallet } = require("../util/wallet");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("faucet_status")
    .setDescription(
      "Displays the current status of the node where the faucet is running.",
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const faucetAccount = await FaucetWallet();
    const nodeStatus = await CosmosGetNodeStatus();
    const balance = await CosmosGetBalance(faucetAccount.address);

    const statusEmbed = new EmbedBuilder()
      .setColor(
        nodeStatus.data.result.sync_info.catching_up ? 0xff0000 : 0x00ff00,
      ) // Red if syncing, Green if caught up
      .setTitle("Faucet Node Status")
      .addFields(
        {
          name: "Moniker",
          value: `\`${nodeStatus.data.result.node_info.moniker}\``,
          inline: true,
        },
        {
          name: "Sync Status",
          value: nodeStatus.data.result.sync_info.catching_up
            ? "Syncing"
            : "Caught Up",
          inline: true,
        },
        {
          name: "Last Block",
          value: `\`${nodeStatus.data.result.sync_info.latest_block_height}\``,
          inline: true,
        },
        { name: "Faucet Address", value: `\`${faucetAccount.address}\`` },
        {
          name: "Faucet Balance",
          value: `\`${balance.data.balance.amount} ${process.env.DENOMINATION}\``,
        },
      )
      .setFooter({ text: "Data fetched from the node." })
      .setTimestamp();

    await interaction.editReply({ embeds: [statusEmbed] });
  },
};
