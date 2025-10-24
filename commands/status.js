const SERVICES = [
  {
    name: "AWS",
    api: "https://health.aws.amazon.com/public/currentevents",
    url: "https://health.aws.amazon.com/health/status",
    status(obj) {
      return obj.length === 6; // wtf aws returns ��[]
    },
  },
  {
    name: "Epic Online Services",
    api: "https://status.epicgames.com/api/v2/status.json",
    url: "https://status.epicgames.com/",
    status(obj) {
      return ["none", "minor"].includes(obj.status.indicator);
    },
  },
  {
    name: "Cloudflare",
    api: "https://www.cloudflarestatus.com/api/v2/status.json",
    url: "https://www.cloudflarestatus.com/",
    status(obj) {
      return ["none", "minor"].includes(obj.status.indicator);
    },
  },
  {
    name: "Meta",
    api: "https://metastatus.com/data/orgs.json",
    url: "https://metastatus.com/",
    status(obj) {
      return !obj.find((org) => {
        return org.services.find((service) => {
          return ![
            "Resolved",
            "No known issues",
            "Low disruptions",
            "Medium disruptions",
          ].includes(service.status);
        });
      });
    },
  },
  {
    name: "GitHub",
    api: "https://www.githubstatus.com/api/v2/status.json",
    url: "https://www.githubstatus.com/",
    status(obj) {
      return ["none", "minor"].includes(obj.status.indicator);
    },
  },
  {
    name: "GRAB",
    api: "https://api.slin.dev/grab-status/v1/status",
    url: "https://api.slin.dev/grab-status/v1/status",
    status(obj) {
      return obj[0].text === "All services are online.\n\n";
    },
  },
  {
    name: "GRAB API",
    api: "https://api.slin.dev/grab/v1/get_level_browser?version=1",
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
        const response = await fetch(service.api, {
          method: "GET",
        });
        if (!response.ok)
          return {
            ...service,
            result: "❌ Error",
          };
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          const success = service.status(json);
          return {
            ...service,
            result: success ? "✅ Operational" : "❌ Problems",
          };
        } catch {
          const success = service.status(text);
          return {
            ...service,
            result: success ? "✅ Operational" : "❌ Problems",
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
