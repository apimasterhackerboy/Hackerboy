import { JSDOM } from "jsdom";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url || !/^https:\/\/t\.me\/[a-zA-Z0-9_]+$/.test(url)) {
    return res.status(400).json({ error: "Invalid Telegram channel URL" });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(500).json({ error: "Failed to fetch the channel page" });
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const metas = document.getElementsByTagName("meta");

    const info = {
      channel_image: "",
      channel_title: "",
      channel_description: "",
      credit: "Developed by Tofazzal Hossain"
    };

    for (let meta of metas) {
      const property = meta.getAttribute("property");
      const content = meta.getAttribute("content");

      if (property === "og:image") {
        info.channel_image = content;
      } else if (property === "og:title") {
        info.channel_title = content;
      } else if (property === "og:description") {
        info.channel_description = content;
      }
    }

    res.status(200).json(info);
  } catch (err) {
    res.status(500).json({ error: "Server error", detail: err.message });
  }
}
