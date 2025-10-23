const SERVICES = [
  {
    name: "AWS",
    url: "https://health.aws.amazon.com/public/currentevents",
    status(obj) {
      return !obj.length;
    },
  },
  {
    name: "Epic Online Services",
    url: "https://status.epicgames.com/api/v2/status.json",
    status(obj) {
      return ["none", "minor"].includes(obj.status.indicator);
    },
  },
  {
    name: "Cloudflare",
    url: "https://www.cloudflarestatus.com/api/v2/status.json",
    status(obj) {
      return ["none", "minor"].includes(obj.status.indicator);
    },
  },
  {
    name: "Meta",
    url: "https://metastatus.com/data/orgs.json",
    status(obj) {
      return !obj.find((org) => {
        return org.services.find((service) => {
          return !["No known issues", "Low disruptions"].includes(
            service.status,
          );
        });
      });
    },
  },
  {
    name: "GitHub",
    url: "https://www.githubstatus.com/api/v2/status.json",
    status(obj) {
      return ["none", "minor"].includes(obj.status.indicator);
    },
  },
  {
    name: "GRAB",
    url: "https://api.slin.dev/grab-status/v1/status",
    status(obj) {
      return obj[0].text === "All services are online.\n\n";
    },
  },
  {
    name: "GRAB API",
    url: "https://api.slin.dev/grab/v1/get_level_browser?version=1",
    status(obj) {
      return !!obj;
    },
  },
];

export async function status(json, env) {
  const results = await Promise.all(
    SERVICES.map(async (service) => {
      try {
        const response = await fetch(service.url, {
          method: "GET",
        });
        if (!response.ok)
          return {
            ...service,
            result: "❌ Error",
          };
        const text = response.text();
        try {
          const json = JSON.parse(text);
          const success = service.status(json);
          return {
            ...service,
            result: success ? "✅ Operational" : "❌ Problems",
          };
        } catch {
          return {
            ...service,
            result: "❌ Error",
          };
        }
      } catch {
        return {
          ...service,
          result: "❌ Error",
        };
      }
    }),
  );

  const embed = {
    type: "rich",
    title: `Status`,
    color: 0x8d85e4,
    description: results
      .map((r) => `[${r.name}](${r.url}): **${r.result}**`)
      .join("\n"),
  };

  return Response.json({
    type: 4,
    data: {
      tts: false,
      content: "",
      embeds: [embed],
      allowed_mentions: { parse: [] },
    },
  });
}
