import dynamic from "next/dynamic";

const AdresseStep = dynamic(() => import("../AdresseStep"), { ssr: false });

export default function Page() {
  return <AdresseStep />;
}