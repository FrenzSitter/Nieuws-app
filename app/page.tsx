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
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Welkom bij Nieuws App
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Ontdek nieuws vanuit verschillende perspectieven. Onze AI-gestuurde aggregator 
          combineert verhalen van meerdere bronnen om je een compleet beeld te geven.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="news-card p-6 text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {sources?.length || 0}
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            Actieve Nieuwsbronnen
          </div>
        </div>
        
        <div className="news-card p-6 text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            24/7
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            Nieuws Monitoring
          </div>
        </div>
        
        <div className="news-card p-6 text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            AI
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            Gestuurde Analyse
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
          Belangrijkste Functies
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="news-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              🔄 Meerdere Perspectieven
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Zie hoe verschillende nieuwsbronnen hetzelfde verhaal brengen en 
              krijg een completer beeld van de werkelijkheid.
            </p>
          </div>
          
          <div className="news-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              🧠 AI Samenvatting
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Onze AI analyseert en vat complexe nieuwsverhalen samen tot 
              heldere, begrijpelijke samenvattingen.
            </p>
          </div>
          
          <div className="news-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              📊 Trending Topics
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Ontdek welke onderwerpen momenteel het meest besproken worden 
              en waarom ze belangrijk zijn.
            </p>
          </div>
          
          <div className="news-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              ⚡ Real-time Updates
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Blijf op de hoogte met real-time nieuws updates van alle 
              belangrijke Nederlandse nieuwsbronnen.
            </p>
          </div>
          
          <div className="news-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              🎯 Gepersonaliseerd
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Filter nieuws op jouw interesses en krijg gepersonaliseerde 
              nieuwsfeeds die bij jou passen.
            </p>
          </div>
          
          <div className="news-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              📱 Responsive Design
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Toegankelijk op alle apparaten - desktop, tablet, en mobiel. 
              Nieuws lezen waar en wanneer je maar wilt.
            </p>
          </div>
        </div>
      </div>

      {/* Active Sources Preview */}
      {sources && sources.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
            Actieve Nieuwsbronnen
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {sources.map((source) => (
              <span
                key={source.id}
                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
              >
                {source.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Klaar om te beginnen?
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Ontdek hoe nieuws er uitziet wanneer je het vanuit verschillende hoeken bekijkt.
        </p>
        <div className="space-x-4">
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Bekijk Trending Nieuws
          </button>
          <button className="border border-gray-300 hover:border-gray-400 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium transition-colors">
            Browse Categorieën
          </button>
        </div>
      </div>
    </div>
  )
}