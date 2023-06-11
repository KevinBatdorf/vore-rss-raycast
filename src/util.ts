import { fetch } from "cross-fetch";
import { Item } from "./types";

const entityMap: { [key: string]: string } = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#039;": "'",
};

const formatString = (string?: string) => {
  if (!string) return "";
  return string.replace(/&[\w#]+;/g, (entity) => entityMap[entity] || "").trim();
};
const tryDate = (date: string) => {
  const match = date.match(/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/);
  if (!match) return date;
  const dateTimeString = match[0];
  const parsed = Date.parse(dateTimeString);
  if (isNaN(parsed)) return dateTimeString;
  return new Date(parsed).toLocaleString();
};

const parseListItems = (html?: string): Item[] | undefined => {
  if (!html) return undefined;
  const itemRegex =
    /<li>\s*<a href="([^"]+)">\s*\s*([^<]+(?:<(?!\/a>)[^<]*)*?)\s*<\/a>(?:\s*<[^>]+>\s*)*<span class=.*title="([^"]+)">published.*via\s*<a.*?>([^<]+)<\/a>/g;
  const matches = Array.from(html.matchAll(itemRegex));

  return matches?.map((match) => ({
    link: match[1],
    title: formatString(match[2]),
    published: tryDate(match[3]),
    source: match[4],
  }));
};

export const fetchFeed = async (urls: string[]) => {
  // the feeds may have huge payloads, so parse it and only includeI guess the latest 20 items
  return Promise.all(
    urls.map(async (url) => {
      const response = await fetch(url);
      const html = await response.text();
      const items = parseListItems(html);
      return items?.slice(0, 20);
    })
  ) as Promise<Item[][]>;
};

export const normalizeTitle = (title: string) =>
  // if over 50 characters, truncate and add ellipsis
  title.length > 50 ? title.slice(0, 50) + "…" : title;

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};
