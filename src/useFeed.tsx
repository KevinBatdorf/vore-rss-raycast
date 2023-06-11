import { getPreferenceValues } from "@raycast/api";
import { useEffect, useState } from "react";
import { fetchFeed, isToday } from "./util";
import { Item } from "./types";

export const useFeed = () => {
  const { username } = getPreferenceValues();
  const [links, setLinks] = useState<Item[]>();

  useEffect(() => {
    if (!username) return;
    fetchFeed([`https://vore.website/${username}`]).then((items) => {
      const flattened = items.flat();
      //   const flattened = items.flat().filter(({ published }) => isToday(new Date(published)));
      if (JSON.stringify(flattened) === JSON.stringify(links)) return;
      setLinks(flattened);
    });
  }, [username]);

  return { links, isLoading: !links };
};
