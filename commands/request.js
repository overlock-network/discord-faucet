const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const api = require("../util/api");
const { CheckIn } = require("../util/registry");
const { MessageFlags } = require("discord-api-types/v10");

async function hasRecentRequest(interaction) {
  const userId = interaction.user.id;
  const cutoffTimestamp = Date.now() - 24 * 60 * 60 * 1000;
  let lastMessageId;

  while (true) {
    const messages = await interaction.channel.messages.fetch({
      limit: 100,
      before: lastMessageId,
    });
    if (messages.size === 0) return false;

    const userRequest = messages.find(
      (msg) =>
        msg.interaction?.user?.id === userId &&
        msg.interaction?.commandName === "request" &&
        msg.createdTimestamp >= cutoffTimestamp,
    );

    if (userRequest) return true;

    const oldestMessage = messages.last();
    lastMessageId = oldestMessage.id;

    if (oldestMessage.createdTimestamp < cutoffTimestamp) {
      return false;
    }
  }
}

async function processFaucetRequest(user, address) {
  CheckIn(address);
  CheckIn(user.toString());
  const result = await api.CosmosTransfer(address);
  return result;
}

function createSuccessEmbed(user, address, result) {
  const sentAmount = process.env.AMOUNT;
  const denomination = process.env.DENOMINATION;

  return new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle("✅ Funds Sent Successfully")
    .setDescription(`Hey ${user}, we've sent you some tokens!`)
    .addFields(
      { name: "Recipient Address", value: `\`${address}\`` },
      { name: "Transaction Hash", value: `\`${result.transactionHash}\`` },
      {
        name: "Amount Sent",
        value: `\`${sentAmount} ${denomination}\``,
        inline: true,
      },
      { name: "Block Height", value: `\`${result.height}\``, inline: true },
      {
        name: "Gas Used",
        value: `\`${result.gasUsed.toString()}\``,
        inline: true,
      },
    )
    .setFooter({
      text: "Use a block explorer to check the transaction status.",
    })
    .setTimestamp();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("request")
    .setDescription("Request coins from the faucet to a given address.")
    .addStringOption((option) =>
      option
        .setName("address")
        .setDescription("The destination cosmos address")
        .setRequired(true),
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (await hasRecentRequest(interaction)) {
      return interaction.editReply({
        content:
          "❌ You’ve already used the `/request` command in the last 24 hours. Please wait before requesting again.",
        ephemeral: true,
      });
    }

    const address = interaction.options.getString("address");
    const result = await processFaucetRequest(interaction.user, address);

    const successEmbed = createSuccessEmbed(interaction.user, address, result);
    await interaction.editReply({ embeds: [successEmbed] });
  },
};
