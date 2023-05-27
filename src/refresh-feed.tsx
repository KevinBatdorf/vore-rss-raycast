import { Icon, LocalStorage, MenuBarExtra, open } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { fetch } from "cross-fetch";
import { useEffect, useState } from "react";
import { MAX_SIZE } from "./constants";

export type Item = {
  title: string;
  link: string;
  published: string;
  source: string;
};

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
const isWithinLast3Hours = (date: Date): boolean => {
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  return date >= threeHoursAgo && date <= now;
};
const normalizeTitle = (title: string) =>
  // if over 50 characters, truncate and add ellipsis
  title.length > 50 ? title.slice(0, 50) + "…" : title;
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

const fetchFeed = async (urls: string[]) => {
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

export default function CheckFeed() {
  const [links, setLinks] = useState<Item[] | undefined>(undefined);
  const recentLinks = links?.filter(({ published }) => isWithinLast3Hours(new Date(published))) ?? [];

  useEffect(() => {
    LocalStorage.getItem<string>("vore-watch-list").then((urls) => {
      if (!urls) return;
      const urlsArray = JSON.parse(urls);
      fetchFeed(urlsArray).then((items) => {
        const flattened = items.flat();
        setLinks(flattened);
      });
    });
  }, []);

  return (
    <MenuBarExtra icon={Icon.Bookmark} isLoading={!links}>
      {recentLinks?.length > 0 ? (
        <MenuBarExtra.Section title="Recent (3 hours)">
          {recentLinks?.slice(0, MAX_SIZE)?.map(({ title, link, published }) => (
            <MenuBarExtra.Item
              key={link}
              icon={getFavicon(link)}
              tooltip={published}
              title={normalizeTitle(title)}
              onAction={() => open(link)}
            />
          ))}
        </MenuBarExtra.Section>
      ) : (
        links
          ?.slice(0, MAX_SIZE)
          ?.map(({ title, link, published }) => (
            <MenuBarExtra.Item
              key={link}
              icon={getFavicon(link)}
              tooltip={published}
              title={normalizeTitle(title)}
              onAction={() => open(link)}
            />
          ))
      )}
    </MenuBarExtra>
  );
}
