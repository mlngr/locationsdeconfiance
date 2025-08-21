import { redirect } from "next/navigation";

export default function NewPropertyPage() {
  // Redirect to the new wizard flow
  redirect("/wizard/adresse");
}
