import MultiPerspectiveCard from '@/components/MultiPerspectiveCard'
import { multiPerspectiveArticles } from '@/lib/sampleNews'

export default function PerspectivesPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-perspective-green-500 to-perspective-green-600 rounded-2xl flex items-center justify-center text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 dark:text-gray-100">
            Nieuws vanuit 
            <span className="block bg-gradient-to-r from-perspective-green-600 to-nonbulla-blue-600 bg-clip-text text-transparent">
              meerdere perspectieven
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Doorbreek je nieuwsbubbel. Ontdek hoe verschillende bronnen hetzelfde verhaal brengen 
            en vorm je eigen, geïnformeerde mening.
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center">
          <div className="flex items-center gap-8 px-8 py-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-perspective-green-600 dark:text-perspective-green-400">
                {multiPerspectiveArticles.reduce((sum, article) => sum + article.totalSources, 0)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Bronnen geanalyseerd
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-nonbulla-blue-600 dark:text-nonbulla-blue-400">
                {multiPerspectiveArticles.reduce((sum, article) => sum + article.perspectives.length, 0)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Verschillende perspectieven
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-analysis-purple-600 dark:text-analysis-purple-400">
                {multiPerspectiveArticles.length}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Onderwerpen
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-gradient-to-br from-perspective-green-50 via-white to-nonbulla-blue-50 dark:from-perspective-green-950/30 dark:via-gray-900 dark:to-nonbulla-blue-950/30 -mx-6 sm:-mx-8 lg:-mx-12 px-6 sm:px-8 lg:px-12 py-12 rounded-2xl">
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">
            Hoe Nonbulla perspectieven analyseert
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-nonbulla-blue-500 to-nonbulla-blue-600 rounded-xl flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3v9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                1. Nieuws Verzamelen
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Onze AI verzamelt artikelen over hetzelfde onderwerp van verschillende betrouwbare Nederlandse nieuwsbronnen.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-analysis-purple-500 to-analysis-purple-600 rounded-xl flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                2. Perspectief Analyse
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Geavanceerde algoritmes analyseren de toon, focus en politieke leaning van elk artikel om verschillende perspectieven te identificeren.
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 bg-gradient-to-br from-perspective-green-500 to-perspective-green-600 rounded-xl flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                3. Compleet Overzicht
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Je krijgt een helder overzicht van alle perspectieven, zodat je een geïnformeerde mening kunt vormen over complexe onderwerpen.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Perspective Articles */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">
            Actuele Onderwerpen met Verschillende Perspectieven
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Live geüpdatet</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {multiPerspectiveArticles.map((article) => (
            <MultiPerspectiveCard
              key={article.id}
              id={article.id}
              title={article.title}
              topic={article.topic}
              perspectives={article.perspectives}
              publishedAt={article.publishedAt}
              totalSources={article.totalSources}
            />
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-nonbulla-blue-500 to-nonbulla-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Bredere Kijk
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Ontdek aspecten van het nieuws die je anders zou missen
          </p>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-perspective-green-500 to-perspective-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Minder Bias
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Vorm een evenwichtiger oordeel door meerdere standpunten
          </p>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-analysis-purple-500 to-analysis-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Meer Context
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Begrijp de achtergrond en complexiteit van nieuws
          </p>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-coral-500 to-accent-coral-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Betere Discussies
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Voer genuanceerdere gesprekken over actuele onderwerpen
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-6 py-12">
        <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">
          Start vandaag met een completer nieuwsbeeld
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Ontdek hoe Nonbulla je helpt om nieuws vanuit verschillende perspectieven te bekijken 
          en een geïnformeerde mening te vormen.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-gradient-to-r from-perspective-green-600 to-perspective-green-700 hover:from-perspective-green-700 hover:to-perspective-green-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Ontdek Alle Perspectieven
          </button>
          <a 
            href="/"
            className="px-8 py-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
          >
            Terug naar Home
          </a>
        </div>
      </div>
    </div>
  )
}