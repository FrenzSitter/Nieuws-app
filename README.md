# Nonbulla – Ontdek het nieuws buiten je bubbel 🌐

Doorbreek je nieuwsbubbel met multi-perspectief AI-analyse. Nonbulla toont verhalen vanuit verschillende invalshoeken, zodat je een completer beeld krijgt van de werkelijkheid. Gebouwd met Next.js 14 en Supabase.

## 🚀 Features

- **Bubble-Breaking Technology**: Doorbreek je nieuwsbubbel met AI-analyse vanuit meerdere perspectieven
- **Perspective Chips**: Duidelijke bronvermelding met politieke context (Links, Centrum, Rechts)
- **Intelligent Synthesis**: AI-gestuurde samenvattingen die verschillende invalshoeken belichten
- **Bewuste Nieuwszoekers**: Ontworpen voor de doelgroep van 25-45 jaar, hoogopgeleid en politiek geëngageerd
- **Mobile-First Design**: Geoptimaliseerd voor 70% mobiel verkeer met scanbare layouts
- **Premium UX**: Moderne, professionele interface geïnspireerd door AllSides.com en NU.nl

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Typography**: Inter (headings) + Source Serif Pro (body)
- **Design System**: Nonbulla Brand Colors (Blue #2563EB, Coral #F97316, Green #059669, Purple #7C3AED)
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deployment**: Vercel
- **Icons**: Custom SVG + Lucide React
- **Styling**: Tailwind CSS + Nonbulla Component System

## 📦 Project Structure

```
nonbulla/
├── app/                    # Next.js 14 App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Homepage
├── components/            # Reusable UI components
├── lib/                  # Utilities and configurations
│   └── supabase/         # Supabase client configurations
├── supabase/             # Database migrations and config
│   ├── config.toml       # Supabase configuration
│   └── migrations/       # Database schema migrations
├── types/                # TypeScript type definitions
├── docs/                 # Documentation and AI agents
└── package.json          # Dependencies and scripts
```

## 🗄️ Database Schema

Het project gebruikt een uitgebreide PostgreSQL database met:

- **news_sources**: RSS bronnen met geloofwaardigheidsscores
- **raw_articles**: Originele artikelen met sentiment analyse
- **topic_clusters**: Gerelateerde artikelen gegroepeerd
- **synthesized_articles**: AI-gegenereerde samenvattingen
- **source_perspectives**: Bronspecifieke invalshoeken

## 🔧 Development Setup

1. **Clone het project:**
   ```bash
   git clone https://github.com/FrenzSitter/Nieuws-app.git
   cd Nieuws-app
   ```

2. **Installeer dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   ```bash
   cp .env.example .env.local
   # Vul je Supabase credentials in
   ```

4. **Database setup:**
   ```bash
   # Start lokale Supabase instance
   npx supabase start
   
   # Push schema naar database
   npx supabase db push
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## 📊 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks
- `npm run db:generate-types` - Generate TypeScript types from database
- `npm run db:reset` - Reset local database
- `npm run db:push` - Push schema changes to database

## 🌐 Deployment

Nonbulla is geconfigureerd voor automatische deployment op Vercel:

1. **Vercel Project**: [nieuws-app.vercel.app](https://nieuws-app.vercel.app) (Nonbulla branded)
2. **Supabase Project**: lstcnbrikiqbjbhdnqor.supabase.co
3. **GitHub Repository**: [FrenzSitter/Nieuws-app](https://github.com/FrenzSitter/Nieuws-app)

### Environment Variables

Zorg ervoor dat deze environment variables zijn ingesteld in Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lstcnbrikiqbjbhdnqor.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
```

## 🤖 AI Agents

Het project bevat 29+ gespecialiseerde AI agents voor verschillende taken:

- **Engineering**: 7 agents voor ontwikkeling
- **Design**: 5 agents voor UI/UX
- **Marketing**: 6 agents voor promotie
- **Product**: 3 agents voor strategie
- **Operations**: 5 agents voor bedrijfsvoering

## 📈 Performance

- **Core Web Vitals optimized**
- **Server-side rendering** voor snelle laadtijden
- **Database indexing** voor efficiënte queries
- **Image optimization** voor snelle loading
- **Progressive Web App** functionaliteit

## 🔒 Security

- **Row Level Security** (RLS) policies
- **Role-based access control**
- **Environment variable protection**
- **CORS configuration**
- **Input sanitization**

## 🤝 Contributing

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/amazing-feature`)
3. Commit je changes (`git commit -m 'Add amazing feature'`)
4. Push naar de branch (`git push origin feature/amazing-feature`)
5. Open een Pull Request

## 📄 License

Dit project is licensed onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

## 📞 Contact

**FrenzSitter** - Project Owner
- GitHub: [@FrenzSitter](https://github.com/FrenzSitter)
- Project Link: [https://github.com/FrenzSitter/Nieuws-app](https://github.com/FrenzSitter/Nieuws-app)

---

**Nonbulla** - *Ontdek het nieuws buiten je bubbel* 🌐✨

## 🎯 Brand Identity

**Nonbulla** (Latin: non + bulla = no bubble) is positioned as intelligent yet accessible - like a well-informed friend explaining complex situations from multiple angles.

- **Mission**: Breaking news bubbles through multi-perspective AI-generated articles
- **Target**: Bewuste Nieuwszoekers (25-45), educated, politically engaged
- **Voice**: Curious, respectful, nuanced - "Bekijk dit eens vanuit een ander perspectief..."
- **Visual**: Modern, trustworthy design that appeals to educated news consumers