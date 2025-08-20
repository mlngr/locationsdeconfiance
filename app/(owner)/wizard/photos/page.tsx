import Link from "next/link";

export default function PhotosPage() {
  return (
    <main className="container py-10 max-w-2xl">
      <h1 className="text-3xl font-bold">Photos</h1>
      <p className="mt-4 text-gray-600">
        Page Photos (placeholder). L'intégration d'upload sera ajoutée ensuite.
      </p>
      <div className="mt-6">
        <Link href="/wizard/adresse" className="btn btn-outline">
          Retour à l'étape Adresse
        </Link>
      </div>
    </main>
  );
}