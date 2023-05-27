import { List, LocalStorage } from "@raycast/api";

export default function Vore() {
  LocalStorage.setItem("vore-watch-list", JSON.stringify(["https://vore.website/j3s"]));
  return <List isLoading={true} />;
}
