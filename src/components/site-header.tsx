import { getCurrentAccount } from "@/lib/accounts";
import { SiteHeaderClient } from "@/components/site-header-client";

export async function SiteHeader({
  showTagline = false,
  onDark = false,
}: {
  showTagline?: boolean;
  onDark?: boolean;
}) {
  const account = await getCurrentAccount();
  return <SiteHeaderClient account={account} showTagline={showTagline} onDark={onDark} />;
}
