const { SlashCommandBuilder } = require("discord.js");
const { MessageFlags } = require("discord-api-types/v10");
const { FaucetAccount } = require("../util/wallet");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("faucet_address")
    .setDescription("Shows the faucet's public address."),
  async execute(interaction) {
    const wallet = await FaucetAccount();
    await interaction.reply({
      embeds: [
        {
          color: 0xfee75c,
          title: "Faucet Address",
          description: `The public address of this faucet is:\n\`${wallet.address}\``,
        },
      ],
      flags: MessageFlags.Ephemeral,
    });
  },
};
