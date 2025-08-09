import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = createClient()
  
  // Fetch some basic stats for the homepage
  const { data: sources } = await supabase
    .from('news_sources')
    .select('id, name')
    .eq('is_active', true)
    .limit(5)

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <div className="text-center space-y-8 py-16">
        <div className="space-y-6">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold text-gray-900 dark:text-gray-100 leading-[1.1] tracking-tight">
            Nieuws buiten
            <br />
            <span className="bg-gradient-to-r from-nonbulla-blue-600 via-nonbulla-blue-700 to-accent-coral-500 bg-clip-text text-transparent">
              je bubbel
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed font-medium">
            Ontdek verhalen vanuit meerdere perspectieven met onze AI-gestuurde nieuwsaggregator.
            <br className="hidden sm:block" />
            Krijg een compleet beeld van de werkelijkheid.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <button className="px-8 py-4 bg-nonbulla-blue-600 hover:bg-nonbulla-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Verken Perspectieven
          </button>
          <button className="px-8 py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:border-gray-500 font-semibold rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">
            Trending Nieuws
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="w-16 h-16 bg-gradient-to-br from-nonbulla-blue-500 to-nonbulla-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">{sources?.length || 0}</span>
          </div>
          <div className="text-gray-900 dark:text-gray-100 font-semibold text-lg mb-2">
            Actieve Nieuwsbronnen
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            Betrouwbare bronnen uit heel Nederland
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="w-16 h-16 bg-gradient-to-br from-perspective-green-500 to-perspective-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-lg font-bold text-white">24/7</span>
          </div>
          <div className="text-gray-900 dark:text-gray-100 font-semibold text-lg mb-2">
            Nieuws Monitoring
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            Continue updates van alle bronnen
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-8 text-center border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
          <div className="w-16 h-16 bg-gradient-to-br from-analysis-purple-500 to-analysis-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-bold text-white">AI</span>
          </div>
          <div className="text-gray-900 dark:text-gray-100 font-semibold text-lg mb-2">
            Gestuurde Analyse
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            Slimme algoritmes voor objectief nieuws
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-display font-bold text-gray-900 dark:text-gray-100">
            Belangrijkste Functies
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Ontdek hoe Nonbulla jou helpt om een completer beeld van het nieuws te krijgen
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="w-12 h-12 bg-gradient-to-br from-nonbulla-blue-500 to-nonbulla-blue-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Meerdere Perspectieven
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Zie hoe verschillende nieuwsbronnen hetzelfde verhaal brengen en 
              krijg een completer beeld van de werkelijkheid.
            </p>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="w-12 h-12 bg-gradient-to-br from-analysis-purple-500 to-analysis-purple-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              AI Samenvatting
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Onze AI analyseert en vat complexe nieuwsverhalen samen tot 
              heldere, begrijpelijke samenvattingen.
            </p>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-coral-500 to-accent-coral-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Trending Topics
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Ontdek welke onderwerpen momenteel het meest besproken worden 
              en waarom ze belangrijk zijn.
            </p>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="w-12 h-12 bg-gradient-to-br from-perspective-green-500 to-perspective-green-600 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Real-time Updates
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Blijf op de hoogte met real-time nieuws updates van alle 
              belangrijke Nederlandse nieuwsbronnen.
            </p>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="w-12 h-12 bg-gradient-to-br from-nonbulla-blue-500 to-analysis-purple-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Gepersonaliseerd
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Filter nieuws op jouw interesses en krijg gepersonaliseerde 
              nieuwsfeeds die bij jou passen.
            </p>
          </div>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-coral-500 to-perspective-green-500 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Responsive Design
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Toegankelijk op alle apparaten - desktop, tablet, en mobiel. 
              Nieuws lezen waar en wanneer je maar wilt.
            </p>
          </div>
        </div>
      </div>

      {/* Active Sources Preview */}
      {sources && sources.length > 0 && (
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">
              Betrouwbare Nieuwsbronnen
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Wij werken samen met de meest betrouwbare Nederlandse nieuwsbronnen
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {sources.map((source) => (
              <span
                key={source.id}
                className="px-6 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 text-gray-800 dark:text-gray-200 rounded-xl text-sm font-medium backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                {source.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="relative bg-gradient-to-br from-nonbulla-blue-50 via-white to-perspective-green-50 dark:from-nonbulla-blue-950/50 dark:via-gray-900 dark:to-perspective-green-950/50 -mx-6 sm:-mx-8 lg:-mx-12 px-6 sm:px-8 lg:px-12 py-20 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-nonbulla-blue-500/5 to-perspective-green-500/5 dark:from-nonbulla-blue-400/5 dark:to-perspective-green-400/5"></div>
        <div className="relative text-center space-y-8">
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 dark:text-gray-100 leading-[1.1]">
              Stap uit je
              <br />
              <span className="bg-gradient-to-r from-nonbulla-blue-600 to-perspective-green-600 bg-clip-text text-transparent">
                nieuwsbubbel
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Ontdek wat je mist wanneer je nieuws alleen vanuit één perspectief bekijkt.
              <br className="hidden sm:block" />
              Begin vandaag met een completer beeld van de werkelijkheid.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button className="px-10 py-5 bg-gradient-to-r from-nonbulla-blue-600 to-nonbulla-blue-700 hover:from-nonbulla-blue-700 hover:to-nonbulla-blue-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Verken Perspectieven
            </button>
            <button className="px-10 py-5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg">
              Trending Nieuws
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}