// Sample news data for demonstrating the news website functionality
export interface NewsArticle {
  id: string
  title: string
  summary: string
  imageUrl: string
  publishedAt: string
  sources: string[]
  category: string
  readingTime: number
  perspectiveCount: number
  isBreaking?: boolean
  href?: string
}

export interface PerspectiveSource {
  id: string
  name: string
  stance: 'supporting' | 'opposing' | 'neutral' | 'mixed'
  summary: string
  politicalLeaning?: 'left' | 'center-left' | 'center' | 'center-right' | 'right'
  credibilityScore: number
}

export interface MultiPerspectiveArticle {
  id: string
  title: string
  topic: string
  perspectives: PerspectiveSource[]
  publishedAt: string
  totalSources: number
}

export interface BreakingNewsItem {
  id: string
  title: string
  href: string
  publishedAt: string
  isUrgent?: boolean
}

// Sample breaking news
export const breakingNews: BreakingNewsItem[] = [
  {
    id: 'breaking-1',
    title: 'Kabinet kondigt nieuwe klimaatmaatregelen aan na EU-top in Brussel',
    href: '/article/breaking-1',
    publishedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    isUrgent: true
  },
  {
    id: 'breaking-2', 
    title: 'Ajax en PSV bereiken akkoord over transfersom Europees talent',
    href: '/article/breaking-2',
    publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
  },
  {
    id: 'breaking-3',
    title: 'Grote storing bij Nederlandse banken opgelost na 3 uur onderbreking',
    href: '/article/breaking-3', 
    publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
  }
]

// Sample hero/featured articles
export const heroArticles: NewsArticle[] = [
  {
    id: 'hero-1',
    title: 'Nederland bereid nieuwe klimaatdoelen EU: Wat betekent dit voor de burger?',
    summary: 'Het Nederlandse kabinet heeft aangekondigd ambitieuze klimaatdoelen te willen omarmen na onderhandelingen in Brussel. Experts zijn verdeeld over de haalbaarheid en gevolgen voor Nederlandse huishoudens.',
    imageUrl: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?w=1200&h=600&fit=crop',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    sources: ['NOS', 'RTL Nieuws', 'De Volkskrant', 'Telegraaf'],
    category: 'Politiek',
    readingTime: 8,
    perspectiveCount: 4,
    isBreaking: true
  },
  {
    id: 'hero-2', 
    title: 'AI-revolutie in Nederlandse ziekenhuizen: Diagnoses 40% sneller',
    summary: 'Ziekenhuizen in Amsterdam en Rotterdam implementeren nieuwe AI-systemen die radiologie-diagnoses drastisch versnellen. Artsen zijn enthousiast, maar roepen op tot voorzichtigheid.',
    imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=600&fit=crop',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    sources: ['NOS', 'Medisch Contact', 'RTL Nieuws'],
    category: 'Technologie',
    readingTime: 6,
    perspectiveCount: 3
  }
]

// Sample regular news articles
export const newsArticles: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Inflatie daalt naar laagste niveau in 2 jaar: Wat merken consumenten?',
    summary: 'Het CBS rapporteert een daling van de inflatie naar 2.1%. Supermarkten en energieleveranciers reageren verschillend op de cijfers.',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    sources: ['CBS', 'NU.nl', 'De Volkskrant'],
    category: 'Economie',
    readingTime: 4,
    perspectiveCount: 3
  },
  {
    id: 'news-2',
    title: 'Feyenoord wint Champions League thriller van Real Madrid',
    summary: 'In een spectaculaire wedstrijd in De Kuip wist Feyenoord Real Madrid te verslaan met 3-2. De Europese pers is vol lof over het Nederlandse voetbal.',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=500&fit=crop',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    sources: ['ESPN', 'Voetbal International', 'NOS Sport'],
    category: 'Sport',
    readingTime: 5,
    perspectiveCount: 2
  },
  {
    id: 'news-3',
    title: 'Nieuwe ChatGPT-concurrent ontwikkeld door Nederlandse universiteiten',
    summary: 'Een consortium van Nederlandse universiteiten presenteert een open-source AI-model dat kan concurreren met ChatGPT. De focus ligt op privacy en transparantie.',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    sources: ['Tweakers', 'Science Magazine', 'RTL Nieuws'],
    category: 'Technologie',
    readingTime: 7,
    perspectiveCount: 4
  },
  {
    id: 'news-4',
    title: 'Oekraïne-conflict: Nederland stuurt extra militaire steun',
    summary: 'Het Nederlandse kabinet kondigt een nieuw steunpakket aan voor Oekraïne, inclusief moderne defensiesystemen. Oppositie vraagt om meer transparantie.',
    imageUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&h=500&fit=crop',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    sources: ['NOS', 'De Volkskrant', 'Trouw', 'RTL Nieuws'],
    category: 'Wereld',
    readingTime: 6,
    perspectiveCount: 4
  },
  {
    id: 'news-5',
    title: 'Nederlandse start-up ontwikkelt doorbraak in zonnepaneeltechnologie',
    summary: 'Een bedrijf uit Eindhoven claimt een zonnepaneel te hebben ontwikkeld dat 60% efficiënter is dan huidige modellen. Internationale investeerders tonen interesse.',
    imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=500&fit=crop',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    sources: ['Eindhovens Dagblad', 'Tweakers', 'FD'],
    category: 'Technologie',
    readingTime: 5,
    perspectiveCount: 3
  },
  {
    id: 'news-6',
    title: 'Rijksmuseum trekt record aantal bezoekers met nieuwe tentoonstelling',
    summary: 'De expositie "Vermeers Geheimen" heeft in één maand meer bezoekers getrokken dan verwacht voor het hele jaar. Internationale musea willen de tentoonstelling overnemen.',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=500&fit=crop',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    sources: ['Het Parool', 'Museumtijdschrift', 'NOS'],
    category: 'Cultuur',
    readingTime: 4,
    perspectiveCount: 2
  },
  {
    id: 'news-7',
    title: 'Woningmarkt Amsterdam: Prijzen stijgen ondanks nieuwe maatregelen',
    summary: 'Ondanks recente overheidsmaatregelen blijven huizenprijzen in Amsterdam stijgen. Makelaars en woningzoekenden reageren verdeeld op de ontwikkelingen.',
    imageUrl: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=800&h=500&fit=crop',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    sources: ['Het Parool', 'NVM', 'RTL Nieuws'],
    category: 'Economie', 
    readingTime: 6,
    perspectiveCount: 3
  },
  {
    id: 'news-8',
    title: 'Max Verstappen wint Grand Prix Nederland voor derde keer op rij',
    summary: 'Voor het derde achtereenvolgende jaar wint Max Verstappen de Dutch Grand Prix in Zandvoort. Tienduizenden Nederlandse fans vieren de overwinning.',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    sources: ['Formula1.nl', 'Ziggo Sport', 'NOS Sport'],
    category: 'Sport',
    readingTime: 4,
    perspectiveCount: 2
  }
]

// Sample multi-perspective articles
export const multiPerspectiveArticles: MultiPerspectiveArticle[] = [
  {
    id: 'perspective-1',
    title: 'Kernenergie in Nederland: Voor en tegen de terugkeer',
    topic: 'Energietransitie',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    totalSources: 6,
    perspectives: [
      {
        id: 'p1-1',
        name: 'De Volkskrant',
        stance: 'supporting',
        summary: 'Kernenergie is essentieel voor het bereiken van klimaatdoelen. Nederland moet investeren in moderne, veilige reactoren om fossiele brandstoffen te vervangen.',
        politicalLeaning: 'center-left',
        credibilityScore: 90
      },
      {
        id: 'p1-2', 
        name: 'Greenpeace Nederland',
        stance: 'opposing',
        summary: 'Kernenergie is gevaarlijk en duur. Nederland moet volledig inzetten op hernieuwbare energie zoals wind en zon, niet op verouderde nucleaire technologie.',
        politicalLeaning: 'left',
        credibilityScore: 75
      },
      {
        id: 'p1-3',
        name: 'Financieele Dagblad',
        stance: 'neutral',
        summary: 'De economische aspecten van kernenergie moeten zorgvuldig worden afgewogen tegen de kosten van alternatieve energiebronnen en klimaatschade.',
        politicalLeaning: 'center-right',
        credibilityScore: 85
      }
    ]
  },
  {
    id: 'perspective-2',
    title: 'Immigratiebeleid Nederland: Verschillende visies op integratie',
    topic: 'Immigratie en Integratie',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    totalSources: 5,
    perspectives: [
      {
        id: 'p2-1',
        name: 'Trouw',
        stance: 'supporting',
        summary: 'Nederland heeft een humaan immigratiebeleid nodig dat kansen biedt voor integratie en bijdraagt aan onze diverse samenleving.',
        politicalLeaning: 'center-left',
        credibilityScore: 88
      },
      {
        id: 'p2-2',
        name: 'Telegraaf',
        stance: 'mixed',
        summary: 'Immigratie kan economische voordelen bieden, maar vereist strengere controles en betere integratievoorzieningen om sociale spanning te voorkomen.',
        politicalLeaning: 'center-right',
        credibilityScore: 75
      },
      {
        id: 'p2-3',
        name: 'NRC Handelsblad',
        stance: 'neutral',
        summary: 'De immigratiediscussie vereist een gefundeerde aanpak gebaseerd op data en onderzoek, niet op emoties of vooroordelen.',
        politicalLeaning: 'center',
        credibilityScore: 92
      }
    ]
  }
]

// Helper functions
export const getArticlesByCategory = (category: string, limit?: number): NewsArticle[] => {
  const filtered = newsArticles.filter(article => 
    category === 'all' || article.category.toLowerCase() === category.toLowerCase()
  )
  return limit ? filtered.slice(0, limit) : filtered
}

export const getTrendingArticles = (limit: number = 5): NewsArticle[] => {
  return [...newsArticles]
    .sort((a, b) => b.perspectiveCount - a.perspectiveCount)
    .slice(0, limit)
}

export const getLatestArticles = (limit: number = 10): NewsArticle[] => {
  return [...newsArticles]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit)
}