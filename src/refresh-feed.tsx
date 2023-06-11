import { MenuBarExtra } from "@raycast/api";
import { useFeed } from "./useFeed";
import { Item } from "./types";
import { getFavicon } from "@raycast/utils";
import { normalizeTitle } from "./util";

export default function CheckFeed() {
  const { links, isLoading } = useFeed();
  return (
    <MenuBarExtra icon={{ source: "command-icon.png" }} isLoading={isLoading}>
      <SingleSource links={links} />
    </MenuBarExtra>
  );
}

export const SingleSource = ({ links }: { links?: Item[] }) => {
  if (links === undefined) return <MenuBarExtra.Item title={"Loading..."} />;
  if (!links?.length) return <MenuBarExtra.Item title={"No posts today"} />;
  return (
    <>
      {links?.map(({ title, link, published }) => (
        <MenuBarExtra.Item
          key={link}
          icon={getFavicon(link)}
          tooltip={published}
          title={normalizeTitle(title)}
          onAction={() => open(link)}
        />
      ))}
    </>
  );
};
