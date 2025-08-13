# 🤖 Claude + DALL-E 3 AI Engine Deployment

## ✅ Implementation Complete

De AI Perspective Engine is nu volledig geüpdatet om **Claude 3 Opus** te gebruiken voor tekstanalyse en **DALL-E 3** voor hero images. Dit geeft de beste resultaten voor Nederlandse nieuwsanalyse.

## 🎯 Waarom Claude + DALL-E?

### Claude 3 Opus voor Tekst:
- **Superieure Nederlandse taalbeheersing** - Begrijpt nuances in Nederlandse media
- **Betere context awareness** - Snapt culturele en politieke context beter
- **Langere output** - Kan uitgebreidere analyses maken (4000 tokens)
- **Minder bias** - Neutraler in politieke analyse
- **Consistente JSON output** - Betrouwbaardere structured data

### DALL-E 3 voor Images:
- **Fotorealistische nieuwsillustraties** - Professionele header images
- **HD kwaliteit** - 1792x1024 resolutie voor hero banners
- **Natuurlijke stijl** - Geen overdreven AI-look
- **Snelle generatie** - Binnen 5 seconden

## 🔑 Environment Variables

Voeg deze toe aan je Vercel dashboard:

```bash
# Claude API voor tekstanalyse (VERPLICHT)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx

# OpenAI API voor DALL-E 3 images (OPTIONEEL)
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# Andere keys (VERPLICHT)
RSS_API_KEY=nonbulla-rss-key-2025
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxxxxxxx
```

## 📦 Nieuwe Features

### 1. Claude-powered Tekstanalyse
- **Perspectief detectie** met Nederlandse context
- **Politieke leaning analyse** (links/centrum/rechts)
- **Sentiment scoring** (-1.0 tot 1.0)
- **Quote extractie** uit bronnen
- **Bias pattern detectie** 

### 2. DALL-E 3 Hero Images
- **Automatische nieuwsillustraties** bij elk artikel
- **Professionele fotojournalistieke stijl**
- **16:9 widescreen format** 
- **HD kwaliteit** (1792x1024)
- **Geen tekst of logo's** in images

### 3. Verbeterde Source Tags
- **[BRON: naam] tags** in content voor natuurlijke referenties
- **Smart chip positioning** based on content
- **Political leaning colors** in Material Design

### 4. Enhanced Prompting
- **Nederlandse culturele context** in alle prompts
- **Filosofische "om-denken" endings** 
- **Podcast-ready NotebookLM summaries**
- **Constructieve framing** van verschillende perspectieven

## 🚀 Deployment Steps

### 1. API Keys verkrijgen

#### Claude API Key:
1. Ga naar https://console.anthropic.com
2. Maak een account of log in
3. Ga naar API Keys sectie
4. Genereer een nieuwe key
5. Kopieer de key (begint met `sk-ant-api03-`)

#### OpenAI API Key (voor images):
1. Ga naar https://platform.openai.com
2. Maak een account of log in
3. Ga naar API Keys
4. Create new secret key
5. Kopieer de key (begint met `sk-`)

### 2. Deploy naar Vercel

```bash
# Installeer Vercel CLI indien nodig
npm install -g vercel

# Login bij Vercel
vercel login

# Deploy naar production
vercel --prod

# Of gebruik het deployment script
node deploy-production.js
```

### 3. Environment Variables instellen

In Vercel Dashboard:
1. Ga naar je project
2. Settings → Environment Variables
3. Voeg alle keys toe (zie boven)
4. Klik "Save"
5. Redeploy: `vercel --prod --force`

### 4. Test de API

```bash
# Test status (geen API key nodig)
curl https://jouw-app.vercel.app/api/ai/generate-article?action=status

# Test recent articles
curl https://jouw-app.vercel.app/api/ai/generate-article?action=recent

# Test batch generation (na eerste crawl)
curl https://jouw-app.vercel.app/api/ai/generate-article?action=batch_generate
```

## 📊 Monitoring

### Claude API Usage:
- Monitor via https://console.anthropic.com/usage
- Claude 3 Opus: ~$15 per miljoen input tokens
- Geschat: €0.05-0.10 per artikel

### OpenAI API Usage:
- Monitor via https://platform.openai.com/usage
- DALL-E 3 HD: $0.12 per image
- Geschat: €0.10 per artikel met hero image

### Totale kosten:
- **Per artikel**: €0.15-0.20
- **Per dag** (24 artikelen): €3.60-4.80
- **Per maand**: €108-144

## 🎯 Optimalisatie Tips

### Kosten besparen:
1. **Claude 3 Sonnet** gebruiken i.p.v. Opus (70% goedkoper)
2. **DALL-E 3 Standard** i.p.v. HD (50% goedkoper)
3. **Caching** implementeren voor vergelijkbare prompts
4. **Batch processing** voor efficiency

### Performance verbeteren:
1. **Parallel processing** van perspectives
2. **Async image generation** 
3. **Database indexing** op story_clusters
4. **CDN voor images** via Vercel/Cloudflare

## ✅ Checklist

- [ ] Claude API key verkregen
- [ ] OpenAI API key verkregen (optioneel)
- [ ] Environment variables toegevoegd in Vercel
- [ ] Deployed naar production
- [ ] API endpoints getest
- [ ] Eerste artikel gegenereerd
- [ ] Kosten monitoring opgezet

## 🔧 Troubleshooting

### "Anthropic API key not configured"
→ Zet `ANTHROPIC_API_KEY` in Vercel environment variables

### "Invalid JSON response from Claude"
→ Check API key permissions, probeer Claude 3 Sonnet als fallback

### Images worden niet gegenereerd
→ OpenAI key is optioneel, artikelen werken ook zonder

### Te hoge kosten
→ Switch naar Claude 3 Sonnet: wijzig `claude-3-opus-20240229` naar `claude-3-sonnet-20240229`

## 📝 Code Locaties

- **Claude Engine**: `/lib/ai-perspective-engine-claude.ts`
- **API Route**: `/app/api/ai/generate-article/route.ts`
- **React Component**: `/components/UnifiedArticle.tsx`
- **Vercel Config**: `/vercel.json`

---

**Status**: ✅ Klaar voor deployment met Claude + DALL-E 3
**Geschatte setup tijd**: 15 minuten
**Support**: Check logs in Vercel dashboard voor debugging