const { SlashCommandBuilder } = require("discord.js");
const { VerifyAddress, CosmosGetBalance } = require("../util/api");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Show address balance.")
    .addStringOption((option) =>
      option
        .setName("address")
        .setDescription("The cosmos address to check")
        .setRequired(true),
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const addr = interaction.options.getString("address");

    VerifyAddress(addr);
    const balance = await CosmosGetBalance(addr);

    await interaction.editReply({
      embeds: [
        {
          color: 0x0099ff,
          title: "Account Balance",
          fields: [
            { name: "Address", value: `\`${addr}\`` },
            {
              name: "Denomination",
              value: `\`${balance.data.balance.denom}\``,
            },
            { name: "Amount", value: `\`${balance.data.balance.amount}\`` },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    });
  },
};
