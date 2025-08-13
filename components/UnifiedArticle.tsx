'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Eye, Clock, Users, Sparkles, Brain, ChevronDown, ChevronUp } from 'lucide-react'

interface SourceChip {
  id: string
  label: string
  source_name: string
  article_url: string
  credibility_score: number
  political_leaning: string
  chip_color: string
}

interface SourcePerspective {
  source_name: string
  source_url: string
  original_title: string
  key_angle: string
  unique_details: string[]
  political_leaning_detected: string
  credibility_assessment: number
  perspective_summary: string
}

interface UnifiedArticleProps {
  id: string
  title: string
  unified_content: string
  source_chips: SourceChip[]
  surprise_ending: string
  source_perspectives_summary: SourcePerspective[]
  perspective_analysis: {
    common_facts: string[]
    different_interpretations: string[]
    bias_analysis: string
    credibility_assessment: string
  }
  metadata: {
    total_sources: number
    confidence_score: number
    ai_model_used: string
    hero_image_url?: string
  }
  generation_timestamp: string
}

export default function UnifiedArticle({
  title,
  unified_content,
  source_chips,
  surprise_ending,
  source_perspectives_summary,
  perspective_analysis,
  metadata,
  generation_timestamp
}: UnifiedArticleProps) {
  const [showPerspectives, setShowPerspectives] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)

  const formatContent = (content: string, chips: SourceChip[]) => {
    // Simple implementation - in production you'd want more sophisticated parsing
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4 text-gray-800 dark:text-gray-200 leading-relaxed">
        {paragraph}
      </p>
    ))
  }

  const getLeaningColor = (leaning: string) => {
    const colors = {
      'left': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'center-left': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', 
      'center': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      'center-right': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'right': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[leaning as keyof typeof colors] || colors.center
  }

  const getCredibilityBadge = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  return (
    <article className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      {/* Hero Image */}
      {metadata.hero_image_url && (
        <div className="w-full h-64 lg:h-80 overflow-hidden">
          <img 
            src={metadata.hero_image_url}
            alt={`Illustratie voor: ${title}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      
      {/* Header */}
      <header className="bg-gradient-to-r from-nonbulla-blue-50 to-perspective-green-50 dark:from-gray-800 dark:to-gray-700 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
              {title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{metadata.total_sources} bronnen</span>
              </div>
              <div className="flex items-center gap-1">
                <Brain className="w-4 h-4" />
                <span>{Math.round(metadata.confidence_score * 100)}% betrouwbaarheid</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(generation_timestamp).toLocaleDateString('nl-NL')}</span>
              </div>
            </div>
          </div>
          <div className="ml-4">
            <div className="bg-nonbulla-blue-100 dark:bg-nonbulla-blue-900 px-3 py-1 rounded-full">
              <span className="text-xs font-medium text-nonbulla-blue-800 dark:text-nonbulla-blue-200">
                Multi-perspectief
              </span>
            </div>
          </div>
        </div>

        {/* Source Chips */}
        <div className="flex flex-wrap gap-2">
          {source_chips.map((chip) => (
            <a
              key={chip.id}
              href={chip.article_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:shadow-md ${getLeaningColor(chip.political_leaning)}`}
            >
              <span>{chip.label}</span>
              <span className="ml-2 text-xs opacity-75">
                {chip.credibility_score}%
              </span>
              <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
            </a>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {formatContent(unified_content, source_chips)}
        </div>

        {/* Surprise Ending */}
        {surprise_ending && (
          <div className="mt-8 p-4 bg-gradient-to-r from-perspective-green-50 to-nonbulla-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border-l-4 border-perspective-green-500">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-perspective-green-600 dark:text-perspective-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Om te overdenken...
                </h3>
                <p className="text-gray-700 dark:text-gray-300 italic">
                  {surprise_ending}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Source Perspectives Section */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowPerspectives(!showPerspectives)}
          className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Verschillende perspectieven ({source_perspectives_summary.length})
            </h3>
            {showPerspectives ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Zie hoe elke bron het verhaal belicht
          </p>
        </button>

        {showPerspectives && (
          <div className="px-6 pb-6 space-y-4">
            {source_perspectives_summary.map((perspective, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {perspective.source_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {perspective.key_angle}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getLeaningColor(perspective.political_leaning_detected)}`}>
                      {perspective.political_leaning_detected}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCredibilityBadge(perspective.credibility_assessment)}`}>
                      {perspective.credibility_assessment}%
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                  {perspective.perspective_summary}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {perspective.unique_details.length > 0 && (
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <strong>Unieke details:</strong> {perspective.unique_details.join(', ')}
                      </div>
                    )}
                  </div>
                  <a
                    href={perspective.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-nonbulla-blue-600 hover:text-nonbulla-blue-700 dark:text-nonbulla-blue-400 dark:hover:text-nonbulla-blue-300 text-sm font-medium flex items-center gap-1"
                  >
                    Lees origineel
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Perspective Analysis */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Perspectief analyse
            </h3>
            {showAnalysis ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Gemeenschappelijke feiten en verschillende interpretaties
          </p>
        </button>

        {showAnalysis && (
          <div className="px-6 pb-6 space-y-4">
            {/* Common Facts */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                Gemeenschappelijke feiten
              </h4>
              <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                {perspective_analysis.common_facts.map((fact, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Different Interpretations */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                Verschillende interpretaties
              </h4>
              <ul className="space-y-1 text-sm text-orange-700 dark:text-orange-300">
                {perspective_analysis.different_interpretations.map((interpretation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{interpretation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bias Analysis */}
            {perspective_analysis.bias_analysis && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  Bias analyse
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {perspective_analysis.bias_analysis}
                </p>
              </div>
            )}

            {/* Credibility Assessment */}
            {perspective_analysis.credibility_assessment && (
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                  Betrouwbaarheidsbeoordeling
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {perspective_analysis.credibility_assessment}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>Gegenereerd met {metadata.ai_model_used}</span>
            <span>•</span>
            <span>Nonbulla - Ontdek het nieuws buiten je bubbel</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>Multi-perspectief artikel</span>
          </div>
        </div>
      </footer>
    </article>
  )
}