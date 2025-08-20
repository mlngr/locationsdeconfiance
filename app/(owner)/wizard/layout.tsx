import NavBar from "@/components/NavBar";
import Stepper from "@/components/wizard/Stepper";

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <NavBar />
      <Stepper />
      {children}
    </main>
  );
}