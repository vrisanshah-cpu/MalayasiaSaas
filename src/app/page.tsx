import { ComplianceChecker } from "@/components/compliance-checker";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12">
      <SiteHeader showTagline />
      <ComplianceChecker />
    </div>
  );
}
