import { Action, ActionPanel, List } from "@raycast/api";
import { useFeed } from "./useFeed";
import { getFavicon } from "@raycast/utils";

export default function Vore() {
  const { links, isLoading } = useFeed();

  return (
    <List isLoading={isLoading}>
      {links && links?.length > 0 ? (
        links?.map(({ title, link }) => (
          <List.Item
            key={link}
            icon={getFavicon(link)}
            title={title}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser title="Open in Browser" url={link} />
              </ActionPanel>
            }
          />
        ))
      ) : (
        <List.EmptyView title="No posts today" icon={{ source: "v.png" }} />
      )}
    </List>
  );
}
