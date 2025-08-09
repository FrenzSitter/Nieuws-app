import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import NewsCard from '@/components/NewsCard'
import { newsArticles, heroArticles, multiPerspectiveArticles } from '@/lib/sampleNews'

interface ArticlePageProps {
  params: {
    id: string
  }
}

// Mock detailed article content
const getArticleDetails = (id: string) => {
  // First check regular news articles
  const article = [...newsArticles, ...heroArticles].find(a => a.id === id)
  
  if (!article) return null

  // Generate detailed content based on the article
  const fullContent = generateFullContent(article)
  const relatedPerspectives = generateRelatedPerspectives(article)
  
  return {
    ...article,
    fullContent,
    relatedPerspectives
  }
}

const generateFullContent = (article: any) => {
  // Generate realistic Dutch article content based on the summary
  const contentMap: Record<string, string> = {
    'news-1': `
      Het Centraal Bureau voor de Statistiek (CBS) rapporteerde deze week dat de inflatie is gedaald naar 2.1%, het laagste niveau in twee jaar. Deze daling komt na maanden van hoge prijsstijgingen die Nederlandse huishoudens zwaar hebben getroffen.

      "Dit is een positieve ontwikkeling voor Nederlandse consumenten," aldus CBS-econoom Dr. Maria van der Berg. "We zien vooral dalende energieprijzen en een stabilisering van voedselprijzen als oorzaak van deze trend."

      ## Impact op Huishoudens

      Nederlandse huishoudens merken de daling vooral bij de pomp en in de supermarkt. Benzineprijzen zijn de afgelopen maand met gemiddeld 15 cent per liter gedaald, terwijl basisproducten zoals brood en melk minder sterk zijn gestegen dan in voorgaande kwartalen.

      Supermarktketen Albert Heijn kondigde aan dat ze de dalende inkoopprijzen gaan doorberekenen aan consumenten. "We zien ruimte om onze prijzen te verlagen, vooral bij verse producten," verklaart CEO Wouter Kolk.

      ## Economische Vooruitzichten

      Economen zijn voorzichtig optimistisch over de verdere ontwikkeling van de inflatie. De Nederlandsche Bank verwacht dat de inflatie dit jaar zal stabiliseren rond de 2%, in lijn met de ECB-doelstelling.

      "Deze cijfers geven ons hoop, maar we moeten voorzichtig blijven," waarschuwt DNB-president Klaas Knot. "Externe factoren zoals geopolitieke spanningen kunnen de prijzen nog altijd beïnvloeden."
    `,
    'news-2': `
      In een adembenemende wedstrijd in De Kuip heeft Feyenoord Real Madrid verslagen met 3-2. Het is een historische overwinning die de Nederlandse voetbalwereld op zijn kop zet en internationale aandacht trekt.

      De wedstrijd begon nerveus voor de Rotterdammers, met Real Madrid dat al na 15 minuten op voorsprong kwam via een goal van Vinícius Júnior. Maar Feyenoord toonde karakter en veerkracht.

      ## Spectaculaire Comeback

      "Dit was pure passie en wilskracht," verklaarde Feyenoord-trainer Arne Slot na afloop. "De spelers hebben laten zien waartoe ze in staat zijn tegen een van de beste teams ter wereld."

      Santiago Giménez opende de score voor Feyenoord in de 28e minuut met een prachtige volley. Igor Paixão zorgde voor de 2-1 vlak voor rust met een individuele actie die het stadion op zijn grondvesten deed daveren.

      ## Europese Erkenning

      De internationale pers is vol lof over de prestatie van Feyenoord. Spaanse sportkrant Marca schrijft: "Feyenoord heeft bewezen dat de Nederlandse voetbalcultuur nog altijd tot verrassingen in staat is."

      UEFA-president Aleksander Čeferin feliciteerde Feyenoord persoonlijk: "Dit soort wedstrijden maken de Champions League tot het mooiste clubtoernooi ter wereld."

      ## Impact voor Nederlands Voetbal

      De overwinning heeft gevolgen voor de coëfficiënt van Nederland in Europa. Bondscoach Ronald Koeman ziet het als bewijs van de kwaliteit van de Eredivisie: "Onze competitie produceert spelers die op het hoogste niveau kunnen presteren."
    `
  }

  return contentMap[article.id] || `
    ${article.summary}

    ## Meer Details

    Dit artikel toont aan hoe ${article.category.toLowerCase()} nieuws vanuit verschillende perspectieven kan worden belicht. Nonbulla verzamelt informatie van ${article.sources.join(', ')} om je een compleet beeld te geven.

    ## Verschillende Invalshoeken

    Elk nieuwsonderwerp heeft meerdere kanten. Door de analyse van ${article.perspectiveCount} verschillende perspectieven krijg je een genuanceerder beeld van de werkelijkheid.

    ## Waarom Dit Belangrijk Is

    In een tijd van polarisatie en misinformatie is het cruciaal om nieuws vanuit verschillende hoeken te bekijken. Dit helpt je een eigen, geïnformeerde mening te vormen.
  `
}

const generateRelatedPerspectives = (article: any) => {
  return [
    {
      id: '1',
      sourceName: article.sources[0] || 'NOS',
      stance: 'neutral' as const,
      summary: `${article.sources[0] || 'NOS'} bericht objectief over de gebeurtenissen en focust op de feiten. De berichtgeving is gebaseerd op officiële bronnen en expert-interviews.`,
      politicalLeaning: 'center' as const,
      credibilityScore: 90
    },
    {
      id: '2', 
      sourceName: article.sources[1] || 'De Volkskrant',
      stance: 'supporting' as const,
      summary: `${article.sources[1] || 'De Volkskrant'} benadrukt de positieve aspecten van de ontwikkelingen en legt verbanden met bredere maatschappelijke trends.`,
      politicalLeaning: 'center-left' as const,
      credibilityScore: 88
    },
    {
      id: '3',
      sourceName: article.sources[2] || 'Telegraaf',
      stance: 'mixed' as const,
      summary: `${article.sources[2] || 'Telegraaf'} toont zowel voor- als nadelen van de situatie en benadrukt de impact op gewone Nederlanders.`,
      politicalLeaning: 'center-right' as const,
      credibilityScore: 75
    }
  ]
}

const getStanceColor = (stance: string) => {
  switch (stance) {
    case 'supporting': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700'
    case 'opposing': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700'
    case 'mixed': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700'
    default: return 'bg-gray-100 dark:bg-gray-700/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600'
  }
}

const getStanceLabel = (stance: string) => {
  switch (stance) {
    case 'supporting': return 'Ondersteunend'
    case 'opposing': return 'Kritisch'
    case 'mixed': return 'Gemengd'
    default: return 'Neutraal'
  }
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const { id } = params
  
  const article = getArticleDetails(id)
  
  if (!article) {
    notFound()
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get related articles (mock)
  const relatedArticles = newsArticles
    .filter(a => a.id !== id && a.category === article.category)
    .slice(0, 3)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">
          Home
        </Link>
        <span>›</span>
        <Link 
          href={`/category/${article.category.toLowerCase()}`}
          className="hover:text-gray-700 dark:hover:text-gray-300"
        >
          {article.category}
        </Link>
        <span>›</span>
        <span className="text-gray-900 dark:text-gray-100 truncate">
          {article.title}
        </span>
      </nav>

      {/* Article Header */}
      <article className="space-y-6">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-nonbulla-blue-600 text-white text-sm font-semibold rounded-full">
              {article.category}
            </span>
            {article.perspectiveCount > 1 && (
              <span className="flex items-center gap-1 px-3 py-1 bg-perspective-green-100 dark:bg-perspective-green-900/30 text-perspective-green-800 dark:text-perspective-green-300 text-sm font-medium rounded-full border border-perspective-green-200 dark:border-perspective-green-700">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {article.perspectiveCount} perspectieven
              </span>
            )}
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {article.title}
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            {article.summary}
          </p>

          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
            <span>{article.readingTime} min leestijd</span>
            <span>{article.sources.length} bronnen</span>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-nonbulla-blue-600 dark:prose-a:text-nonbulla-blue-400">
          <div dangerouslySetInnerHTML={{ __html: article.fullContent.replace(/\n/g, '<br />') }} />
        </div>

        {/* Sources */}
        <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Bronnen voor dit artikel
          </h3>
          <div className="flex flex-wrap gap-3">
            {article.sources.map((source, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      </article>

      {/* Different Perspectives */}
      {article.relatedPerspectives && article.relatedPerspectives.length > 0 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">
              Verschillende Perspectieven
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Ontdek hoe verschillende nieuwsbronnen dit verhaal brengen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {article.relatedPerspectives.map((perspective) => (
              <div key={perspective.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {perspective.sourceName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium border rounded ${getStanceColor(perspective.stance)}`}>
                        {getStanceLabel(perspective.stance)}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>{perspective.credibilityScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {perspective.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">
            Gerelateerde Artikelen
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((relatedArticle) => (
              <NewsCard
                key={relatedArticle.id}
                id={relatedArticle.id}
                title={relatedArticle.title}
                summary={relatedArticle.summary}
                imageUrl={relatedArticle.imageUrl}
                publishedAt={relatedArticle.publishedAt}
                sources={relatedArticle.sources}
                category={relatedArticle.category}
                readingTime={relatedArticle.readingTime}
                isPerspective={relatedArticle.perspectiveCount > 1}
                perspectiveCount={relatedArticle.perspectiveCount}
              />
            ))}
          </div>
        </div>
      )}

      {/* Back to Category */}
      <div className="pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
        <Link 
          href={`/category/${article.category.toLowerCase()}`}
          className="inline-flex items-center gap-2 text-nonbulla-blue-600 dark:text-nonbulla-blue-400 hover:text-nonbulla-blue-700 dark:hover:text-nonbulla-blue-300 font-semibold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Terug naar {article.category}
        </Link>
      </div>
    </div>
  )
}