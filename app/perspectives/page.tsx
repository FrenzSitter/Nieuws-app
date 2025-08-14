export default function PerspectivesPage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-perspective-green-500 to-perspective-green-600 rounded-2xl flex items-center justify-center text-white">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 dark:text-gray-100">
            Multi-Perspectief Analyse
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            AI-gedreven analyse van nieuwsgebeurtenissen vanuit verschillende invalshoeken voor een compleet beeld.
          </p>
        </div>
      </div>

      {/* Coming Soon Message */}
      <div className="text-center py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">
            Binnenkort beschikbaar
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Onze AI engine analyseert momenteel nieuwsartikelen om verschillende perspectieven te identificeren. 
            Deze functie wordt binnenkort geactiveerd zodra voldoende artikelen zijn verwerkt.
          </p>
          
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Wat te verwachten:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-perspective-green-500 rounded-full" />
                <span>Automatische perspectief detectie</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-perspective-green-500 rounded-full" />
                <span>Bronnen clustering per verhaal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-perspective-green-500 rounded-full" />
                <span>Bias analyse en neutraliteit scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-perspective-green-500 rounded-full" />
                <span>Gerelateerde verhalen koppeling</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}