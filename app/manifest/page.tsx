import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Manifest - Nonbulla',
  description: 'Het manifest van Nonbulla: Waarom we nieuws buiten je bubbel brengen en hoe we dat transparant en eerlijk doen.',
  openGraph: {
    title: 'Manifest - Nonbulla',
    description: 'Het manifest van Nonbulla: Waarom we nieuws buiten je bubbel brengen en hoe we dat transparant en eerlijk doen.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manifest - Nonbulla',
    description: 'Het manifest van Nonbulla: Waarom we nieuws buiten je bubbel brengen en hoe we dat transparant en eerlijk doen.',
  }
}

export default function ManifestPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-8">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-nonbulla-blue-500 to-nonbulla-blue-600 rounded-3xl flex items-center justify-center text-white">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-display font-bold text-gray-900 dark:text-gray-100">
            Nonbulla Manifest
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Waarom we bestaan, waar we voor staan, en hoe we nieuws buiten je bubbel brengen
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Why We Exist */}
        <section className="space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl text-white mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">
              Het Probleem
            </h2>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong className="text-red-600 dark:text-red-400">Nederland zit vast in nieuwsbubbels.</strong> We lezen alleen wat onze mening bevestigt. 
                Linkse lezers lezen linkse media, rechtse lezers rechtse media. Het resultaat? Een verdeelde samenleving 
                waar mensen elkaar niet meer begrijpen.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Algoritmes versterken dit probleem. Social media toont je alleen wat je wilt zien. 
                Nieuwswebsites gebruiken clickbait om aandacht te trekken. De nuance verdwijnt, polarisatie neemt toe.
              </p>
            </div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-nonbulla-blue-500 to-nonbulla-blue-600 rounded-2xl text-white mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">
              Onze Missie
            </h2>
          </div>
          
          <div className="bg-gradient-to-br from-nonbulla-blue-50 to-perspective-green-50 dark:from-nonbulla-blue-950/30 dark:to-perspective-green-950/30 rounded-2xl border border-nonbulla-blue-200/50 dark:border-nonbulla-blue-700/50 p-8">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-xl font-semibold">
                <strong className="text-nonbulla-blue-600 dark:text-nonbulla-blue-400">Nonbulla doorbreekt je nieuwsbubbel.</strong>
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Wij geloven dat een gezonde democratie begint met goed geïnformeerde burgers. Daarom tonen wij hetzelfde 
                nieuwsonderwerp vanuit verschillende perspectieven. Linkse en rechtse bronnen, mainstream en alternatieve media, 
                Nederlandse en internationale invalshoeken.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Ons doel is niet om je te vertellen wat je moet denken, maar om je alle informatie te geven 
                die je nodig hebt om zelf een geïnformeerde mening te vormen.
              </p>
            </div>
          </div>
        </section>

        {/* How We Work */}
        <section className="space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-perspective-green-500 to-perspective-green-600 rounded-2xl text-white mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">
              Hoe We Werken
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Technical Process */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-analysis-purple-500 to-analysis-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Technisch Proces</h3>
              </div>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-nonbulla-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Automatische RSS-crawling</strong> van 26+ betrouwbare nieuwsbronnen</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-nonbulla-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>AI-gestuurde clustering</strong> van vergelijkbare nieuwsonderwerpen</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-nonbulla-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Cross-referentie detectie</strong> tussen verschillende bronnen</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-nonbulla-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Claude AI-analyse</strong> voor perspectief en bias-detectie</span>
                </li>
              </ul>
            </div>

            {/* Editorial Standards */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-perspective-green-500 to-perspective-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Kwaliteitsborging</h3>
              </div>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-perspective-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Minimaal 2 primaire bronnen</strong> (NU.nl, Volkskrant, NOS, Telegraaf)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-perspective-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Gelaagde bronnenselectie:</strong> primair, secundair, specialistisch</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-perspective-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Transparante bronvermelding</strong> met politieke leanings</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-perspective-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Fact-checking</strong> en credibiliteitsscoring</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Our Sources */}
        <section className="space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-analysis-purple-500 to-analysis-purple-600 rounded-2xl text-white mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3v9" />
              </svg>
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">
              Onze Bronnen
            </h2>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold text-nonbulla-blue-600 dark:text-nonbulla-blue-400 mb-4">Primaire Bronnen</h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• NU.nl (trigger-bron)</li>
                  <li>• De Volkskrant</li>
                  <li>• NOS Nieuws</li>
                  <li>• De Telegraaf</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-perspective-green-600 dark:text-perspective-green-400 mb-4">Secundaire Bronnen</h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• AD.nl</li>
                  <li>• RTL Nieuws</li>
                  <li>• De Gelderlander</li>
                  <li>• Trouw</li>
                  <li>• Het Parool</li>
                  <li>• BN DeStem</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-analysis-purple-600 dark:text-analysis-purple-400 mb-4">Specialistische Bronnen</h4>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• The Guardian</li>
                  <li>• Reuters</li>
                  <li>• AP News</li>
                  <li>• Politico EU</li>
                  <li>• Follow The Money</li>
                  <li>• De Correspondent</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-analysis-purple-600 rounded-2xl text-white mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">
              Onze Waarden
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-nonbulla-blue-500 to-nonbulla-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Transparantie</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Open over onze bronnen, methoden en AI-analyse</p>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-perspective-green-500 to-perspective-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-1m0 0l-3-1m3 1l-3 1" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Neutraliteit</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Geen politieke agenda, alleen feiten en perspectieven</p>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-analysis-purple-500 to-analysis-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Kwaliteit</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alleen betrouwbare bronnen en grondige verificatie</p>
            </div>
          </div>
        </section>

        {/* Future Vision */}
        <section className="space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl text-white mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">
              Onze Toekomstvisie
            </h2>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border border-amber-200/50 dark:border-amber-700/50 p-8">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We dromen van een Nederland waar mensen weer met elkaar in gesprek gaan over belangrijke onderwerpen. 
                Waar nuance wordt gewaardeerd boven polarisatie. Waar burgers geïnformeerde beslissingen maken op basis 
                van complete informatie, niet op basis van algoritmes die hun vooroordelen bevestigen.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                <strong>Nonbulla is het begin van die beweging.</strong> Door technologie en journalistiek te combineren, 
                maken we kwalitatieve nieuwsconsumptie toegankelijk voor iedereen. Elke dag, op elk apparaat, 
                met respect voor je tijd en intelligentie.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center space-y-6 py-8">
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">
            Wordt onderdeel van de beweging
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Help ons een Nederland te bouwen waar iedereen toegang heeft tot complete, eerlijke nieuwsberichtgeving.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-nonbulla-blue-600 hover:bg-nonbulla-blue-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Start met lezen
            </Link>
            <Link
              href="/category/nederland"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Verken categorieën
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}