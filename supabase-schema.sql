-- Supabase Database Schema voor Nieuws Aggregator
-- PostgreSQL met Row Level Security (RLS) policies

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =====================================================
-- 1. NEWS_SOURCES TABLE
-- =====================================================
CREATE TABLE news_sources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    rss_feed_url TEXT NOT NULL UNIQUE,
    category VARCHAR(100),
    country_code VARCHAR(2),
    language_code VARCHAR(5) DEFAULT 'nl',
    credibility_score INTEGER DEFAULT 50 CHECK (credibility_score >= 0 AND credibility_score <= 100),
    political_leaning VARCHAR(20) CHECK (political_leaning IN ('left', 'center-left', 'center', 'center-right', 'right', 'unknown')),
    update_frequency_minutes INTEGER DEFAULT 60,
    last_fetched_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    fetch_error_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. RAW_ARTICLES TABLE
-- =====================================================
CREATE TABLE raw_articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source_id UUID NOT NULL REFERENCES news_sources(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    url TEXT NOT NULL,
    author VARCHAR(255),
    published_at TIMESTAMPTZ NOT NULL,
    guid VARCHAR(500),
    image_url TEXT,
    categories TEXT[],
    tags TEXT[],
    word_count INTEGER,
    reading_time_minutes INTEGER,
    language_detected VARCHAR(5),
    sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
    is_duplicate BOOLEAN DEFAULT false,
    duplicate_of UUID REFERENCES raw_articles(id),
    processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'processed', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(source_id, guid),
    UNIQUE(source_id, url)
);

-- =====================================================
-- 3. TOPIC_CLUSTERS TABLE
-- =====================================================
CREATE TABLE topic_clusters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    keywords TEXT[] NOT NULL,
    main_topic VARCHAR(100),
    sub_topics TEXT[],
    geographic_focus VARCHAR(100),
    time_period_start TIMESTAMPTZ NOT NULL,
    time_period_end TIMESTAMPTZ NOT NULL,
    article_count INTEGER DEFAULT 0,
    total_engagement INTEGER DEFAULT 0,
    average_sentiment DECIMAL(3,2),
    trending_score INTEGER DEFAULT 0 CHECK (trending_score >= 0 AND trending_score <= 100),
    cluster_method VARCHAR(50) DEFAULT 'semantic',
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'merged', 'archived')),
    merged_into UUID REFERENCES topic_clusters(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. SYNTHESIZED_ARTICLES TABLE
-- =====================================================
CREATE TABLE synthesized_articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cluster_id UUID NOT NULL REFERENCES topic_clusters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    full_content TEXT,
    key_points TEXT[],
    different_perspectives TEXT[],
    source_count INTEGER NOT NULL,
    total_source_articles INTEGER NOT NULL,
    credibility_score INTEGER CHECK (credibility_score >= 0 AND credibility_score <= 100),
    political_balance JSONB, -- {"left": 2, "center": 3, "right": 1}
    geographic_coverage TEXT[],
    main_image_url TEXT,
    reading_time_minutes INTEGER,
    synthesis_method VARCHAR(50) DEFAULT 'ai_summary',
    quality_indicators JSONB DEFAULT '{}',
    fact_check_status VARCHAR(20) DEFAULT 'pending' CHECK (fact_check_status IN ('pending', 'verified', 'disputed', 'false')),
    publish_status VARCHAR(20) DEFAULT 'draft' CHECK (publish_status IN ('draft', 'review', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. SOURCE_PERSPECTIVES TABLE
-- =====================================================
CREATE TABLE source_perspectives (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cluster_id UUID NOT NULL REFERENCES topic_clusters(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES raw_articles(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES news_sources(id) ON DELETE CASCADE,
    perspective_summary TEXT NOT NULL,
    key_quotes TEXT[],
    stance VARCHAR(50), -- 'supporting', 'opposing', 'neutral', 'mixed'
    emphasis_topics TEXT[],
    unique_angles TEXT[],
    factual_claims TEXT[],
    opinion_elements TEXT[],
    source_credibility_weight DECIMAL(3,2) DEFAULT 1.0,
    perspective_novelty_score INTEGER CHECK (perspective_novelty_score >= 0 AND perspective_novelty_score <= 100),
    bias_indicators JSONB DEFAULT '{}',
    relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(cluster_id, article_id, source_id)
);

-- =====================================================
-- RELATIONSHIP TABLES
-- =====================================================

-- Articles in clusters (many-to-many)
CREATE TABLE cluster_articles (
    cluster_id UUID NOT NULL REFERENCES topic_clusters(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES raw_articles(id) ON DELETE CASCADE,
    relevance_score DECIMAL(3,2) CHECK (relevance_score >= 0 AND relevance_score <= 1),
    is_primary BOOLEAN DEFAULT false,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (cluster_id, article_id)
);

-- Related clusters
CREATE TABLE related_clusters (
    cluster_id UUID NOT NULL REFERENCES topic_clusters(id) ON DELETE CASCADE,
    related_cluster_id UUID NOT NULL REFERENCES topic_clusters(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50), -- 'similar', 'follow_up', 'contradiction', 'background'
    strength DECIMAL(3,2) CHECK (strength >= 0 AND strength <= 1),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (cluster_id, related_cluster_id),
    CHECK (cluster_id != related_cluster_id)
);

-- =====================================================
-- 7. STORY CLUSTERS TABLE
-- =====================================================
CREATE TABLE story_clusters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    primary_topic VARCHAR(500) NOT NULL,
    keywords TEXT[] NOT NULL,
    detection_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sources_found TEXT[] DEFAULT '{}',
    sources_missing TEXT[] DEFAULT '{}',
    processing_status VARCHAR(20) DEFAULT 'detecting' CHECK (processing_status IN ('detecting', 'analyzing', 'complete', 'failed')),
    unified_article_id UUID,
    recheck_scheduled_at TIMESTAMPTZ,
    trigger_source VARCHAR(100), -- Which source triggered this cluster
    similarity_threshold DECIMAL(3,2) DEFAULT 0.80,
    article_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. UNIFIED ARTICLES TABLE  
-- =====================================================
CREATE TABLE unified_articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cluster_id UUID NOT NULL REFERENCES story_clusters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    unified_content TEXT NOT NULL,
    perspective_analysis JSONB DEFAULT '{}', -- Per-source analysis
    source_chips JSONB[] DEFAULT '{}', -- Clickable source references
    surprise_ending TEXT, -- "Om-denken" afsluiting
    notebooklm_summary TEXT, -- Extended summary for podcast
    ai_model_used VARCHAR(50) DEFAULT 'gpt-4',
    generation_timestamp TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. SOURCE PERSPECTIVES TABLE
-- =====================================================
CREATE TABLE source_perspectives (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cluster_id UUID NOT NULL REFERENCES story_clusters(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES raw_articles(id) ON DELETE CASCADE,
    source_name VARCHAR(100) NOT NULL,
    original_article_url TEXT NOT NULL,
    original_title TEXT NOT NULL,
    key_angle TEXT,
    unique_details TEXT[] DEFAULT '{}',
    sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
    political_leaning_detected VARCHAR(20),
    credibility_assessment INTEGER CHECK (credibility_assessment >= 0 AND credibility_assessment <= 100),
    perspective_summary TEXT,
    quote_extracts TEXT[] DEFAULT '{}',
    analysis_timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. CONTENT WORKFLOWS TABLE
-- =====================================================
CREATE TABLE content_workflows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cluster_id UUID REFERENCES story_clusters(id) ON DELETE CASCADE,
    unified_article_id UUID REFERENCES unified_articles(id) ON DELETE CASCADE,
    workflow_status VARCHAR(20) DEFAULT 'draft' CHECK (workflow_status IN ('draft', 'review', 'approved', 'published', 'rejected', 'archived')),
    ai_confidence_score DECIMAL(3,2) CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1),
    editorial_priority INTEGER DEFAULT 5 CHECK (editorial_priority >= 1 AND editorial_priority <= 10),
    auto_publish_eligible BOOLEAN DEFAULT false,
    scheduled_publish_at TIMESTAMPTZ,
    workflow_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. EDITORIAL REVIEWS TABLE
-- =====================================================
CREATE TABLE editorial_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES content_workflows(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(100), -- User/editor identifier
    review_action VARCHAR(20) NOT NULL CHECK (review_action IN ('approve', 'reject', 'edit', 'flag', 'request_changes')),
    feedback TEXT,
    changes_requested TEXT,
    priority_adjustment INTEGER, -- Change in priority
    auto_publish_decision BOOLEAN,
    review_metadata JSONB DEFAULT '{}',
    reviewed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- News sources indexes
CREATE INDEX idx_news_sources_active ON news_sources(is_active) WHERE is_active = true;
CREATE INDEX idx_news_sources_category ON news_sources(category);
CREATE INDEX idx_news_sources_update_freq ON news_sources(update_frequency_minutes, last_fetched_at);

-- Raw articles indexes
CREATE INDEX idx_raw_articles_source_published ON raw_articles(source_id, published_at DESC);
CREATE INDEX idx_raw_articles_processing_status ON raw_articles(processing_status) WHERE processing_status != 'processed';
CREATE INDEX idx_raw_articles_published_at ON raw_articles(published_at DESC);
CREATE INDEX idx_raw_articles_url_hash ON raw_articles USING hash(url);
CREATE INDEX idx_raw_articles_guid ON raw_articles(source_id, guid);
CREATE INDEX idx_raw_articles_duplicates ON raw_articles(is_duplicate, duplicate_of) WHERE is_duplicate = true;
CREATE INDEX idx_raw_articles_quality ON raw_articles(quality_score DESC) WHERE quality_score IS NOT NULL;
CREATE INDEX idx_raw_articles_sentiment ON raw_articles(sentiment_score) WHERE sentiment_score IS NOT NULL;

-- Full-text search indexes
CREATE INDEX idx_raw_articles_title_fts ON raw_articles USING gin(to_tsvector('dutch', title));
CREATE INDEX idx_raw_articles_content_fts ON raw_articles USING gin(to_tsvector('dutch', content));
CREATE INDEX idx_raw_articles_description_fts ON raw_articles USING gin(to_tsvector('dutch', description));

-- Topic clusters indexes
CREATE INDEX idx_topic_clusters_time_period ON topic_clusters(time_period_start, time_period_end);
CREATE INDEX idx_topic_clusters_trending ON topic_clusters(trending_score DESC) WHERE status = 'active';
CREATE INDEX idx_topic_clusters_main_topic ON topic_clusters(main_topic);
CREATE INDEX idx_topic_clusters_keywords_gin ON topic_clusters USING gin(keywords);
CREATE INDEX idx_topic_clusters_status_created ON topic_clusters(status, created_at DESC);

-- Synthesized articles indexes
CREATE INDEX idx_synthesized_articles_cluster ON synthesized_articles(cluster_id);
CREATE INDEX idx_synthesized_articles_published ON synthesized_articles(publish_status, published_at DESC) 
    WHERE publish_status = 'published';
CREATE INDEX idx_synthesized_articles_credibility ON synthesized_articles(credibility_score DESC);
CREATE INDEX idx_synthesized_articles_views ON synthesized_articles(view_count DESC);

-- Source perspectives indexes
CREATE INDEX idx_source_perspectives_cluster ON source_perspectives(cluster_id);
CREATE INDEX idx_source_perspectives_article ON source_perspectives(article_id);
CREATE INDEX idx_source_perspectives_source ON source_perspectives(source_id);
CREATE INDEX idx_source_perspectives_stance ON source_perspectives(stance);
CREATE INDEX idx_source_perspectives_relevance ON source_perspectives(relevance_score DESC);

-- Relationship tables indexes
CREATE INDEX idx_cluster_articles_relevance ON cluster_articles(relevance_score DESC);
CREATE INDEX idx_cluster_articles_primary ON cluster_articles(cluster_id, is_primary) WHERE is_primary = true;
CREATE INDEX idx_related_clusters_type ON related_clusters(relationship_type, strength DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE synthesized_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_perspectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE cluster_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE related_clusters ENABLE ROW LEVEL SECURITY;

-- Create user roles if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'news_admin') THEN
        CREATE ROLE news_admin;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'news_editor') THEN
        CREATE ROLE news_editor;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'news_reader') THEN
        CREATE ROLE news_reader;
    END IF;
END
$$;

-- =====================================================
-- NEWS_SOURCES RLS POLICIES
-- =====================================================

-- Admins can do everything
CREATE POLICY "news_sources_admin_all" ON news_sources
    FOR ALL TO news_admin
    USING (true)
    WITH CHECK (true);

-- Editors can read and update sources
CREATE POLICY "news_sources_editor_read" ON news_sources
    FOR SELECT TO news_editor
    USING (true);

CREATE POLICY "news_sources_editor_update" ON news_sources
    FOR UPDATE TO news_editor
    USING (true)
    WITH CHECK (true);

-- Readers can only read active sources
CREATE POLICY "news_sources_reader_active" ON news_sources
    FOR SELECT TO news_reader
    USING (is_active = true);

-- Public can read basic source info for active sources
CREATE POLICY "news_sources_public_read" ON news_sources
    FOR SELECT TO anon
    USING (is_active = true);

-- =====================================================
-- RAW_ARTICLES RLS POLICIES
-- =====================================================

-- Admins can do everything
CREATE POLICY "raw_articles_admin_all" ON raw_articles
    FOR ALL TO news_admin
    USING (true)
    WITH CHECK (true);

-- Editors can read and update articles
CREATE POLICY "raw_articles_editor_all" ON raw_articles
    FOR ALL TO news_editor
    USING (true)
    WITH CHECK (true);

-- Readers can only read processed articles from active sources
CREATE POLICY "raw_articles_reader_processed" ON raw_articles
    FOR SELECT TO news_reader
    USING (
        processing_status = 'processed' 
        AND EXISTS (
            SELECT 1 FROM news_sources 
            WHERE news_sources.id = raw_articles.source_id 
            AND news_sources.is_active = true
        )
    );

-- Public can read basic article info for processed articles
CREATE POLICY "raw_articles_public_basic" ON raw_articles
    FOR SELECT TO anon
    USING (
        processing_status = 'processed'
        AND quality_score >= 50
        AND EXISTS (
            SELECT 1 FROM news_sources 
            WHERE news_sources.id = raw_articles.source_id 
            AND news_sources.is_active = true
        )
    );

-- =====================================================
-- TOPIC_CLUSTERS RLS POLICIES
-- =====================================================

-- Admins can do everything
CREATE POLICY "topic_clusters_admin_all" ON topic_clusters
    FOR ALL TO news_admin
    USING (true)
    WITH CHECK (true);

-- Editors can manage active clusters
CREATE POLICY "topic_clusters_editor_active" ON topic_clusters
    FOR ALL TO news_editor
    USING (status = 'active')
    WITH CHECK (status = 'active');

-- Readers can read active clusters
CREATE POLICY "topic_clusters_reader_active" ON topic_clusters
    FOR SELECT TO news_reader
    USING (status = 'active');

-- Public can read active clusters with good trending scores
CREATE POLICY "topic_clusters_public_trending" ON topic_clusters
    FOR SELECT TO anon
    USING (status = 'active' AND trending_score >= 30);

-- =====================================================
-- SYNTHESIZED_ARTICLES RLS POLICIES
-- =====================================================

-- Admins can do everything
CREATE POLICY "synthesized_articles_admin_all" ON synthesized_articles
    FOR ALL TO news_admin
    USING (true)
    WITH CHECK (true);

-- Editors can manage drafts and reviews
CREATE POLICY "synthesized_articles_editor_manage" ON synthesized_articles
    FOR ALL TO news_editor
    USING (publish_status IN ('draft', 'review'))
    WITH CHECK (publish_status IN ('draft', 'review', 'published'));

-- Readers can read published articles
CREATE POLICY "synthesized_articles_reader_published" ON synthesized_articles
    FOR SELECT TO news_reader
    USING (publish_status = 'published');

-- Public can read high-quality published articles
CREATE POLICY "synthesized_articles_public_quality" ON synthesized_articles
    FOR SELECT TO anon
    USING (
        publish_status = 'published' 
        AND credibility_score >= 70
        AND fact_check_status IN ('verified', 'pending')
    );

-- =====================================================
-- SOURCE_PERSPECTIVES RLS POLICIES
-- =====================================================

-- Admins can do everything
CREATE POLICY "source_perspectives_admin_all" ON source_perspectives
    FOR ALL TO news_admin
    USING (true)
    WITH CHECK (true);

-- Editors can manage perspectives
CREATE POLICY "source_perspectives_editor_all" ON source_perspectives
    FOR ALL TO news_editor
    USING (true)
    WITH CHECK (true);

-- Readers can read perspectives for active clusters
CREATE POLICY "source_perspectives_reader_active" ON source_perspectives
    FOR SELECT TO news_reader
    USING (
        EXISTS (
            SELECT 1 FROM topic_clusters 
            WHERE topic_clusters.id = source_perspectives.cluster_id 
            AND topic_clusters.status = 'active'
        )
    );

-- Public can read high-relevance perspectives
CREATE POLICY "source_perspectives_public_relevant" ON source_perspectives
    FOR SELECT TO anon
    USING (
        relevance_score >= 70
        AND EXISTS (
            SELECT 1 FROM topic_clusters 
            WHERE topic_clusters.id = source_perspectives.cluster_id 
            AND topic_clusters.status = 'active'
            AND topic_clusters.trending_score >= 30
        )
    );

-- =====================================================
-- RELATIONSHIP TABLES RLS POLICIES
-- =====================================================

-- Cluster articles - follow cluster permissions
CREATE POLICY "cluster_articles_follow_cluster" ON cluster_articles
    FOR SELECT TO anon, news_reader
    USING (
        EXISTS (
            SELECT 1 FROM topic_clusters 
            WHERE topic_clusters.id = cluster_articles.cluster_id 
            AND topic_clusters.status = 'active'
        )
    );

CREATE POLICY "cluster_articles_editor_manage" ON cluster_articles
    FOR ALL TO news_editor, news_admin
    USING (true)
    WITH CHECK (true);

-- Related clusters - follow cluster permissions
CREATE POLICY "related_clusters_follow_cluster" ON related_clusters
    FOR SELECT TO anon, news_reader
    USING (
        EXISTS (
            SELECT 1 FROM topic_clusters 
            WHERE topic_clusters.id = related_clusters.cluster_id 
            AND topic_clusters.status = 'active'
        )
    );

CREATE POLICY "related_clusters_editor_manage" ON related_clusters
    FOR ALL TO news_editor, news_admin
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- DATABASE TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_news_sources_updated_at BEFORE UPDATE ON news_sources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_raw_articles_updated_at BEFORE UPDATE ON raw_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_topic_clusters_updated_at BEFORE UPDATE ON topic_clusters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_synthesized_articles_updated_at BEFORE UPDATE ON synthesized_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_source_perspectives_updated_at BEFORE UPDATE ON source_perspectives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate article word count and reading time
CREATE OR REPLACE FUNCTION calculate_article_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate word count from content
    IF NEW.content IS NOT NULL THEN
        NEW.word_count = array_length(string_to_array(NEW.content, ' '), 1);
        -- Reading time: average 200 words per minute
        NEW.reading_time_minutes = GREATEST(1, ROUND(NEW.word_count / 200.0));
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply article metrics trigger
CREATE TRIGGER calculate_raw_articles_metrics 
    BEFORE INSERT OR UPDATE ON raw_articles 
    FOR EACH ROW EXECUTE FUNCTION calculate_article_metrics();

-- Function to update topic cluster article count
CREATE OR REPLACE FUNCTION update_cluster_article_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE topic_clusters 
        SET article_count = article_count + 1,
            updated_at = NOW()
        WHERE id = NEW.cluster_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE topic_clusters 
        SET article_count = article_count - 1,
            updated_at = NOW()
        WHERE id = OLD.cluster_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Apply cluster article count trigger
CREATE TRIGGER update_cluster_article_count_trigger
    AFTER INSERT OR DELETE ON cluster_articles
    FOR EACH ROW EXECUTE FUNCTION update_cluster_article_count();

-- Function to prevent duplicate articles (same URL from same source)
CREATE OR REPLACE FUNCTION prevent_duplicate_articles()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for existing article with same URL from same source
    IF EXISTS (
        SELECT 1 FROM raw_articles 
        WHERE source_id = NEW.source_id 
        AND url = NEW.url 
        AND id != COALESCE(NEW.id, uuid_generate_v4())
    ) THEN
        RAISE EXCEPTION 'Article with URL % already exists for source %', NEW.url, NEW.source_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply duplicate prevention trigger
CREATE TRIGGER prevent_duplicate_articles_trigger
    BEFORE INSERT OR UPDATE ON raw_articles
    FOR EACH ROW EXECUTE FUNCTION prevent_duplicate_articles();

-- Function to auto-update synthesized article metrics
CREATE OR REPLACE FUNCTION update_synthesized_article_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate reading time from summary and content
    IF NEW.summary IS NOT NULL OR NEW.full_content IS NOT NULL THEN
        NEW.reading_time_minutes = GREATEST(1, ROUND(
            array_length(string_to_array(
                COALESCE(NEW.full_content, NEW.summary), ' '
            ), 1) / 200.0
        ));
    END IF;
    
    -- Update published_at when status changes to published
    IF NEW.publish_status = 'published' AND OLD.publish_status != 'published' THEN
        NEW.published_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply synthesized article metrics trigger
CREATE TRIGGER update_synthesized_article_metrics_trigger
    BEFORE UPDATE ON synthesized_articles
    FOR EACH ROW EXECUTE FUNCTION update_synthesized_article_metrics();

-- Function to update source fetch statistics
CREATE OR REPLACE FUNCTION update_source_fetch_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Successful fetch - reset error count, update last_fetched_at
        UPDATE news_sources 
        SET last_fetched_at = NOW(),
            fetch_error_count = 0,
            updated_at = NOW()
        WHERE id = NEW.source_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply source fetch stats trigger
CREATE TRIGGER update_source_fetch_stats_trigger
    AFTER INSERT ON raw_articles
    FOR EACH ROW EXECUTE FUNCTION update_source_fetch_stats();

-- Function to calculate trending scores based on recent activity
CREATE OR REPLACE FUNCTION calculate_trending_score(cluster_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    article_count_24h INTEGER;
    article_count_7d INTEGER;
    avg_sentiment DECIMAL;
    source_diversity INTEGER;
    trending_score INTEGER;
BEGIN
    -- Count articles in last 24 hours
    SELECT COUNT(*) INTO article_count_24h
    FROM cluster_articles ca
    JOIN raw_articles ra ON ca.article_id = ra.id
    WHERE ca.cluster_id = cluster_id_param
    AND ra.published_at >= NOW() - INTERVAL '24 hours';
    
    -- Count articles in last 7 days
    SELECT COUNT(*) INTO article_count_7d
    FROM cluster_articles ca
    JOIN raw_articles ra ON ca.article_id = ra.id
    WHERE ca.cluster_id = cluster_id_param
    AND ra.published_at >= NOW() - INTERVAL '7 days';
    
    -- Get average sentiment
    SELECT AVG(ra.sentiment_score) INTO avg_sentiment
    FROM cluster_articles ca
    JOIN raw_articles ra ON ca.article_id = ra.id
    WHERE ca.cluster_id = cluster_id_param
    AND ra.sentiment_score IS NOT NULL;
    
    -- Count unique sources
    SELECT COUNT(DISTINCT ra.source_id) INTO source_diversity
    FROM cluster_articles ca
    JOIN raw_articles ra ON ca.article_id = ra.id
    WHERE ca.cluster_id = cluster_id_param;
    
    -- Calculate trending score (0-100)
    trending_score = LEAST(100, GREATEST(0, 
        (article_count_24h * 10) +  -- Recent activity weight
        (article_count_7d * 2) +   -- Weekly activity
        (COALESCE(ABS(avg_sentiment), 0) * 20) + -- Sentiment intensity
        (source_diversity * 5)     -- Source diversity bonus
    ));
    
    RETURN trending_score;
END;
$$ language 'plpgsql';

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to get articles by similarity
CREATE OR REPLACE FUNCTION get_similar_articles(
    input_title TEXT,
    input_content TEXT,
    similarity_threshold DECIMAL DEFAULT 0.3,
    max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    article_id UUID,
    title TEXT,
    similarity_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ra.id,
        ra.title,
        GREATEST(
            similarity(ra.title, input_title),
            similarity(COALESCE(ra.content, ''), COALESCE(input_content, ''))
        ) as sim_score
    FROM raw_articles ra
    WHERE ra.processing_status = 'processed'
    AND (
        similarity(ra.title, input_title) > similarity_threshold
        OR similarity(COALESCE(ra.content, ''), COALESCE(input_content, '')) > similarity_threshold
    )
    ORDER BY sim_score DESC
    LIMIT max_results;
END;
$$ language 'plpgsql';

-- Function to archive old clusters
CREATE OR REPLACE FUNCTION archive_old_clusters()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    UPDATE topic_clusters 
    SET status = 'archived',
        updated_at = NOW()
    WHERE status = 'active'
    AND time_period_end < NOW() - INTERVAL '30 days'
    AND trending_score < 10;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$ language 'plpgsql';

-- =====================================================
-- SAMPLE DATA INSERTION (OPTIONAL)
-- =====================================================

-- Insert sample news sources
-- Enhanced nieuwsbronnen met tiers
INSERT INTO news_sources (name, url, rss_feed_url, category, country_code, credibility_score, political_leaning, metadata) VALUES
-- Primary Dutch Sources
('NU.nl Algemeen', 'https://nu.nl', 'https://www.nu.nl/rss/Algemeen', 'algemeen', 'NL', 80, 'center', '{"tier": "primary", "priority_weight": 10, "cross_reference_required": true}'),
('De Telegraaf RSS', 'https://telegraaf.nl', 'https://www.telegraaf.nl/rss/', 'algemeen', 'NL', 75, 'center-right', '{"tier": "primary", "priority_weight": 9, "cross_reference_required": true}'),
('De Telegraaf Binnenland', 'https://telegraaf.nl', 'https://www.telegraaf.nl/binnenland/', 'binnenland', 'NL', 75, 'center-right', '{"tier": "primary", "priority_weight": 8, "cross_reference_required": true}'),
('De Telegraaf Buitenland', 'https://telegraaf.nl', 'https://www.telegraaf.nl/buitenland/', 'buitenland', 'NL', 75, 'center-right', '{"tier": "primary", "priority_weight": 8, "cross_reference_required": true}'),
('De Volkskrant Voorpagina', 'https://volkskrant.nl', 'https://www.volkskrant.nl/voorpagina/rss.xml', 'kwaliteit', 'NL', 90, 'center-left', '{"tier": "primary", "priority_weight": 9, "cross_reference_required": true}'),
('De Volkskrant Achtergrond', 'https://volkskrant.nl', 'https://www.volkskrant.nl/nieuws-achtergrond/rss.xml', 'achtergrond', 'NL', 90, 'center-left', '{"tier": "primary", "priority_weight": 8, "cross_reference_required": true}'),
('NOS Journaal', 'https://nos.nl', 'http://feeds.nos.nl/nosjournaal', 'algemeen', 'NL', 85, 'center', '{"tier": "primary", "priority_weight": 10, "cross_reference_required": true}'),
('NOS Nieuwsuur', 'https://nos.nl', 'http://feeds.nos.nl/nieuwsuuralgemeen', 'achtergrond', 'NL', 85, 'center', '{"tier": "primary", "priority_weight": 8, "cross_reference_required": true}'),

-- Secondary Dutch Sources
('NRC', 'https://nrc.nl', 'http://feeds.feedburner.com/nrc/FmXV', 'kwaliteit', 'NL', 88, 'center-left', '{"tier": "secondary", "priority_weight": 7, "cross_reference_required": false}'),
('AD Algemeen', 'https://ad.nl', 'https://www.ad.nl/home/rss.xml', 'populair', 'NL', 70, 'center', '{"tier": "secondary", "priority_weight": 6, "cross_reference_required": false}'),
('Trouw', 'https://trouw.nl', 'http://www.trouw.nl/rss/laatstenieuws/laatstenieuws/', 'kwaliteit', 'NL', 82, 'center-left', '{"tier": "secondary", "priority_weight": 6, "cross_reference_required": false}'),
('RTL Nieuws', 'https://rtl.nl', 'http://www.rtl.nl/service/rss/rtlnieuws/index.xml', 'algemeen', 'NL', 78, 'center', '{"tier": "secondary", "priority_weight": 6, "cross_reference_required": false}'),

-- Specialty Dutch Sources  
('Financieele Dagblad', 'https://fd.nl', 'http://fd.nl/?widget=rssfeed&view=feed&contentId=33810', 'economie', 'NL', 85, 'center', '{"tier": "specialty", "priority_weight": 5, "cross_reference_required": false}'),
('Reformatorisch Dagblad', 'https://refdag.nl', 'http://www.refdag.nl/rss/laatste+nieuws.rss', 'religieus', 'NL', 60, 'right', '{"tier": "specialty", "priority_weight": 4, "cross_reference_required": false}'),
('Elsevier Weekblad', 'https://elsevierweekblad.nl', 'https://www.elsevierweekblad.nl/feed/', 'opinie', 'NL', 72, 'center-right', '{"tier": "specialty", "priority_weight": 4, "cross_reference_required": false}'),
('Nederlands Dagblad', 'https://nd.nl', 'http://www.nd.nl/rss/nieuws', 'religieus', 'NL', 65, 'center-right', '{"tier": "specialty", "priority_weight": 4, "cross_reference_required": false}'),
('Nieuws.nl', 'https://nieuws.nl', 'https://nieuws.nl/feed/', 'algemeen', 'NL', 60, 'center', '{"tier": "specialty", "priority_weight": 3, "cross_reference_required": false}'),
('Maghreb Magazine', 'https://maghrebmagazine.nl', 'http://www.maghrebmagazine.nl/feed/', 'multicultureel', 'NL', 55, 'center-left', '{"tier": "specialty", "priority_weight": 3, "cross_reference_required": false}'),
('NOS 60 Seconden', 'https://nos.nl', 'http://feeds.nos.nl/nos-nieuwsin60seconden', 'kort', 'NL', 85, 'center', '{"tier": "specialty", "priority_weight": 3, "cross_reference_required": false}'),
('Rijksoverheid', 'https://rijksoverheid.nl', 'https://www.rijksoverheid.nl/rss', 'overheid', 'NL', 95, 'center', '{"tier": "specialty", "priority_weight": 7, "cross_reference_required": false}'),

-- International Sources
('New York Times', 'https://nytimes.com', 'https://www.nytimes.com/rss', 'internationaal', 'US', 85, 'center-left', '{"tier": "international", "priority_weight": 5, "cross_reference_required": false}'),
('Vox', 'https://vox.com', 'https://www.vox.com/rss/index.xml', 'internationaal', 'US', 75, 'center-left', '{"tier": "international", "priority_weight": 4, "cross_reference_required": false}'),
('Vox Politics', 'https://vox.com', 'https://www.vox.com/rss/politics/index.xml', 'politiek', 'US', 75, 'center-left', '{"tier": "international", "priority_weight": 4, "cross_reference_required": false}'),
('BBC World', 'https://bbc.co.uk', 'https://feeds.bbci.co.uk/news/world/rss.xml', 'internationaal', 'UK', 88, 'center', '{"tier": "international", "priority_weight": 6, "cross_reference_required": false}'),
('NBC News', 'https://nbcnews.com', 'https://feeds.nbcnews.com/nbcnews/public/news', 'internationaal', 'US', 78, 'center', '{"tier": "international", "priority_weight": 4, "cross_reference_required": false}'),
('CNBC', 'https://cnbc.com', 'https://www.cnbc.com/id/100727362/device/rss/rss.html', 'economie', 'US', 80, 'center', '{"tier": "international", "priority_weight": 4, "cross_reference_required": false}')

ON CONFLICT (rss_feed_url) DO NOTHING;