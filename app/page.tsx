import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function Home() {
  return (
    <main>
      <NavBar />

      {/* Hero */}
      <section className="container py-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            La location longue durée, <span className="text-gray-600">enfin</span> simplifiée et sécurisée.
          </h1>
          <p className="mt-4 text-base md:text-lg text-gray-600 max-w-2xl">
            Publiez vos annonces, sélectionnez vos locataires, encaissez les loyers (commission 2%) et automatisez vos documents.
          </p>
          {/* Allow CTAs to wrap on small screens */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn btn-primary" href="/signup">Commencer</Link>
            <Link className="btn btn-outline" href="/properties">Voir les annonces</Link>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-lg">
          <Image
            src="/assets/hero.png"
            alt="Locations de confiance"
            width={1200}
            height={640}
            priority
            className="w-full h-auto"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      {/* Capsules / features */}
      <section className="container py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[
          { title: "Propriétaires", img: "/assets/owner.png", text: "Créez et gérez vos annonces en quelques clics." },
          { title: "Locataires", img: "/assets/tenant.png", text: "Trouvez le logement idéal et payez en ligne." },
          { title: "Docs & Paiements", img: "/assets/hero.png", text: "Quittances et paiements simplifiés (2% de commission)." }
        ].map((c, i) => (
          <div key={i} className="card">
            <div className="rounded-xl overflow-hidden">
              <Image src={c.img} alt="" width={800} height={450} className="w-full h-auto" sizes="(max-width: 768px) 100vw, 33vw" />
            </div>
            <h3 className="mt-3 text-lg md:text-xl font-semibold">{c.title}</h3>
            <p className="text-gray-600">{c.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
