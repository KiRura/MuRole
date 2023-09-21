try {
  require("dotenv").config();
  const { Client, GatewayIntentBits, PermissionFlagsBits, ApplicationCommandOptionType } = require("discord.js");
  const client = new Client({ intents: Object.values(GatewayIntentBits) });
  const Ping = require("ping");
  const date = new Date();
  console.log("loaded modules");

  const mutaocolor = 16760703;
  const redcolor = 16744319;
  const greencolor = 9043849;

  const not_has_manage_role = "ロール管理の権限がありません。";
  const cannot_manage_role = "このロールは管理できません。";

  function now() {
    const weeks = ["日", "月", "火", "水", "木", "金", "土"];
    const dayOfWeek = weeks[dt.getDay()];
    return `${date.getFullYear} / ${date.getMonth() + 1} / ${date.getDate()} (${dayOfWeek}) ${date.getHours()} : ${date.getMinutes()} : ${date.getSeconds()} . ${date.getMilliseconds()}`;
  };

  async function isGuild(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({ content: "サーバー内でのみ実行できます。", ephemeral: true });
      return false;
    };
    return true;
  };

  async function permissionHas(interaction, PermissionFlagsBits, String) {
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits)) {
      await interaction.reply({ content: String, ephemeral: true });
      return false;
    };
    return true;
  };

  function avatar_to_URL(user) {
    if (user.avatarURL()) {
      return user.avatarURL({ size: 4096 });
    } else {
      return user.defaultAvatarURL
    };
  };

  async function ping() {
    return (await Ping.promise.probe("8.8.8.8")).time;
  };

  function roleHas(user, role) {
    return user.roles.cache.has(role.id);
  };

  async function managerole(user, or, role, interaction) {
    const has = user.roles.cache.has(role.id);
    if (or === "add") {
      if (has) {
        await interaction.reply({ content: "既にロールが付いています。", ephemeral: true });
        return false;
      };
      user.roles.add(role)
        .then(() => {
          return true
        })
        .catch(async error => {
          await interaction.reply({ content: cannot_manage_role });
          return false;
        });
    } else {
      if (!has) {
        await interaction.reply({ content: "既にロールが外されています。", ephemeral: true });
        return false;
      };
      user.roles.remove(role)
        .then(() => {
          return true
        })
        .catch(async error => {
          await interaction.reply({ content: cannot_manage_role });
          return false;
        });
    }
  }

  client.once("ready", async () => {
    setInterval(async () => {
      client.user.setActivity({ name: `${(await client.guilds.fetch()).size} servers・${client.users.cache.size} users・${await ping()} ms` });
    }, 10000);

    console.log("setting commands...");
    await client.application.commands.set([
      { // ping
        name: "ping",
        description: "ピンポン"
      },
      { // role
        name: "role",
        description: "ロール管理",
        options: [
          {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: "user",
            description: "1ユーザーを対象に",
            options: [
              {
                type: ApplicationCommandOptionType.Subcommand,
                name: "add",
                description: "付与",
                options: [
                  {
                    type: ApplicationCommandOptionType.User,
                    name: "user",
                    description: "対象ユーザー",
                    required: true
                  },
                  {
                    type: ApplicationCommandOptionType.Role,
                    name: "role",
                    description: "付与するロール",
                    required: true
                  }
                ]
              },
              {
                type: ApplicationCommandOptionType.Subcommand,
                name: "remove",
                description: "剥奪",
                options: [
                  {
                    type: ApplicationCommandOptionType.User,
                    name: "user",
                    description: "対象ユーザー",
                    required: true
                  },
                  {
                    type: ApplicationCommandOptionType.Role,
                    name: "role",
                    description: "剥奪するロール",
                    required: true
                  }
                ]
              },
              {
                type: ApplicationCommandOptionType.Subcommand,
                name: "list",
                description: "ロール一覧",
                options: [
                  {
                    type: ApplicationCommandOptionType.User,
                    name: "user",
                    description: "対象ユーザー",
                    required: true
                  }
                ]
              }
            ]
          },
          {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: "all",
            description: "全ユーザーを対象に",
            options: [
              {
                type: ApplicationCommandOptionType.Subcommand,
                name: "add",
                description: "付与",
                options: [
                  {
                    type: ApplicationCommandOptionType.Role,
                    name: "role",
                    description: "付与するロール",
                    required: true
                  },
                  {
                    type: ApplicationCommandOptionType.Boolean,
                    name: "ignorebot",
                    description: "botを除外する"
                  }
                ]
              },
              {
                type: ApplicationCommandOptionType.Subcommand,
                name: "remove",
                description: "剥奪",
                options: [
                  {
                    type: ApplicationCommandOptionType.Role,
                    name: "role",
                    description: "剥奪するロール",
                    required: true
                  },
                  {
                    type: ApplicationCommandOptionType.Boolean,
                    name: "ignorebot",
                    description: "botを除外する"
                  }
                ]
              }
            ]
          },
          {
            type: ApplicationCommandOptionType.SubcommandGroup,
            name: "bot",
            description: "botを対象に",
            options: [
              {
                type: ApplicationCommandOptionType.Subcommand,
                name: "add",
                description: "付与",
                options: [
                  {
                    type: ApplicationCommandOptionType.Role,
                    name: "role",
                    description: "付与するロール",
                    required: true
                  }
                ]
              },
              {
                type: ApplicationCommandOptionType.Subcommand,
                name: "remove",
                description: "剥奪",
                options: [
                  {
                    type: ApplicationCommandOptionType.Role,
                    name: "role",
                    description: "剥奪するロール",
                    required: true
                  }
                ]
              }
            ]
          }
        ]
      }
    ]);

    console.log(`${client.user.tag} all ready`);
  });

  client.on("interactionCreate", async interaction => {
    try {
      if (!interaction.isChatInputCommand()) return;
      const command = interaction.command.name;
      const option = interaction.options;
      const inguild_commands = ["role"];
      if (inguild_commands === command) {
        if (!(await isGuild(interaction))) return;
      };
      const kirura = await client.users.fetch("606093171151208448");

      if (command === "ping") {
        let embed = {
          embeds: [
            {
              title: "Pong!",
              color: mutaocolor,
              fields: [
                {
                  name: "WebSocket",
                  value: `${client.ws.ping} ms`,
                  inline: true
                },
                {
                  name: "API Endpoint",
                  value: `waiting...`,
                  inline: true
                },
                {
                  name: "ping 8.8.8.8",
                  value: `${await ping()} ms`,
                  inline: true
                }
              ],
              footer: {
                text: `Created by ${kirura.tag}`,
                iconURL: avatar_to_URL(kirura)
              }
            }
          ]
        };
        await interaction.reply(embed);
        interaction.fetchReply()
          .then(reply => {
            embed.embeds[0].fields[1].value = `${reply.createdTimestamp - interaction.createdTimestamp} ms`;
            interaction.editReply(embed).catch(error => { });
          })
          .catch(error => { });
      };

      if (command === "role") {
        const group = option.getSubcommandGroup();
        const manage = option.getSubcommand();
        if (!(await permissionHas(interaction, PermissionFlagsBits.ManageRoles, not_has_manage_role)) && (manage === "add" || manage === "remove")) return;
        const user = option.getMember("user");
        const role = option.getRole("role");

        if (group === "user") {
          if (manage === "add" || manage === "remove") {
            if ((await managerole(user, manage, role, interaction)) === false) return;
            const content = manage === "add" ? `${user.displayName} への ${role.name} の付与が完了しました。` : `${user.displayName} から ${role.name} の剥奪が完了しました。`;
            await interaction.reply(content);

          } else {
            const size = user.roles.cache.size;
            if (size === 1) return await interaction.reply({ content: `対象のユーザー ${user.displayName} にロールが付いていません。`, ephemeral: true });
            const rolesize = (await interaction.guild.roles.fetch()).size;
            const highest = user.roles.highest;
            const color = user.roles.color;
            await interaction.reply({
              embeds: [
                {
                  title: `${user.user.tag} のロール一覧 (${size - 1})`,
                  description: `${user.roles.cache.map(role => {
                    if (role.name === "@everyone") return;
                    return `${role}`;
                  }).join("\n")}\n**最上位:** ${highest} (${rolesize - highest.rawPosition} / ${rolesize})${color !== null ? `\n**色**: ${color} (${color.hexColor})` : ""}`,
                  color: color ? color.color : mutaocolor,
                  thumbnail: { url: avatar_to_URL(user.user) }
                }
              ]
            });
          };

        } else {
          const members = await interaction.guild.members.fetch();
          const ignore = option.getBoolean("ignorebot");
          let membersize = 0;
          members.map(member => {
            if (group === "all") {
              if (ignore && member.user.bot) return;
            } else {
              if (!member.user.bot) return;
            };
            const has = roleHas(member, role);
            if (manage === "add") {
              if (has) return;
            } else {
              if (!has) return;
            };
            membersize++;
          });
          if (membersize === 0) return await interaction.reply({ content: "対象人数が0人です。", ephemeral: true });

          let content = manage === "add" ? `${membersize}人に ${role.name} の付与を開始します。` : `${membersize}人から ${role.name} の剥奪を開始します。`;
          await interaction.reply(content);

          await Promise.all(members.map(async member => {
            if (group === "all") {
              if (ignore && member.user.bot) return;
            } else {
              if (!member.user.bot) return;
            };
            const has = roleHas(member, role)
            if (manage === "add") {
              if (has) return;
              await member.roles.add(role);
            } else {
              if (!has) return;
              await member.roles.remove(role);
            };
          }));

          content = manage === "add" ? `${membersize}人への ${role.name} の付与が完了しました。` : `${membersize}人からの ${role.name} の剥奪が完了しました。`;
          interaction.user.send(content).catch(error => { });
          interaction.fetchReply()
            .then(async () => { return await interaction.editReply(content); })
            .catch(error => {
              interaction.channel.send(content)
                .catch(error => { });
            });
        };
      };
    } catch (error) {
      console.log(now());
      console.error(error);
    };
  });

  client.login(process.env.DISCORD_BOT_TOKEN);
} catch (error) {
  console.log(now());
  console.error(error);
};
