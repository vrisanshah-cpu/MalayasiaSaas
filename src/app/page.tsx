import { SiteHeader } from "@/components/site-header";
import { LandingPage } from "@/components/landing-page";
import { RULE_COUNT } from "@/lib/regulatory-rules";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <LandingPage ruleCount={RULE_COUNT} header={<SiteHeader onDark />} />
    </div>
  );
}
