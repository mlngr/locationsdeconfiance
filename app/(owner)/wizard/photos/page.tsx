import Link from "next/link";

export default function Page() {
  return (
    <main className="container py-10 max-w-2xl">
      <h1 className="text-3xl font-bold">Photos</h1>
      <div className="mt-6 grid gap-4">
        <p className="text-gray-600">
          Cette section pour l'ajout de photos sera implémentée prochainement.
        </p>
        <div className="flex justify-between mt-4">
          <Link href="/wizard/adresse" className="btn btn-outline">
            Retour à l'adresse
          </Link>
          <button type="button" className="btn btn-primary" disabled>
            Suivant (bientôt disponible)
          </button>
        </div>
      </div>
    </main>
  );
}