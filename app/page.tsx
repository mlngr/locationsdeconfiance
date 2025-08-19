import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function Home() {
  return (
    <main>
      <NavBar />
      <section className="container py-16 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">La location longue durée, <span className="text-gray-600">enfin</span> simplifiée et sécurisée.</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl">
            Publiez vos annonces, sélectionnez vos locataires, encaissez les loyers (commission 2%) et automatisez vos documents.
          </p>
          <div className="mt-8 flex gap-3">
            <Link className="btn btn-primary" href="/signup">Commencer</Link>
            <Link className="btn btn-outline" href="/properties">Voir les annonces</Link>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <Image src="/assets/hero.png" alt="LokSecure" width={1200} height={640} priority />
        </div>
      </section>

      <section className="container py-12 grid md:grid-cols-3 gap-6">
        {[
          { title: "Propriétaires", img: "/assets/owner.png", text: "Créez et gérez vos annonces en quelques clics." },
          { title: "Locataires", img: "/assets/tenant.png", text: "Trouvez le logement idéal et payez en ligne." },
          { title: "Docs & Paiements", img: "/assets/hero.png", text: "Quittances et paiements simplifiés (2% de commission)." }
        ].map((c, i)=> (
          <div key={i} className="card">
            <Image src={c.img} alt="" width={800} height={450} />
            <h3 className="mt-3 text-xl font-semibold">{c.title}</h3>
            <p className="text-gray-600">{c.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
