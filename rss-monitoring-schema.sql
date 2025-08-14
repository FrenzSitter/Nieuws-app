-- RSS Monitoring Tables for Nieuws-app
-- Add these tables to your existing Supabase schema for comprehensive RSS monitoring

-- =====================================================
-- RSS FETCH LOGS TABLE
-- =====================================================
CREATE TABLE rss_fetch_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    total_sources INTEGER NOT NULL DEFAULT 0,
    successful_sources INTEGER NOT NULL DEFAULT 0,
    failed_sources INTEGER NOT NULL DEFAULT 0,
    total_articles INTEGER NOT NULL DEFAULT 0,
    new_articles INTEGER NOT NULL DEFAULT 0,
    duplicate_articles INTEGER NOT NULL DEFAULT 0,
    errors TEXT[] DEFAULT '{}',
    execution_time_ms INTEGER NOT NULL,
    triggered_by VARCHAR(50) NOT NULL CHECK (triggered_by IN ('automated', 'manual', 'cron', 'webhook')),
    trigger_metadata JSONB DEFAULT '{}', -- Store additional context like user_id, source trigger, etc.
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed', 'partial')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    source_details JSONB DEFAULT '{}', -- Per-source execution details
    performance_metrics JSONB DEFAULT '{}', -- Memory usage, query times, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RSS SOURCE FETCH LOGS TABLE (Detailed per-source logs)
-- =====================================================
CREATE TABLE rss_source_fetch_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    fetch_log_id UUID NOT NULL REFERENCES rss_fetch_logs(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES news_sources(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'timeout', 'invalid_feed')),
    articles_found INTEGER DEFAULT 0,
    articles_added INTEGER DEFAULT 0,
    articles_updated INTEGER DEFAULT 0,
    articles_skipped INTEGER DEFAULT 0,
    execution_time_ms INTEGER NOT NULL,
    error_message TEXT,
    error_code VARCHAR(50),
    http_status_code INTEGER,
    feed_last_modified TIMESTAMPTZ,
    feed_etag VARCHAR(255),
    response_size_bytes INTEGER,
    parse_time_ms INTEGER,
    network_time_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- RSS MONITORING ALERTS TABLE
-- =====================================================
CREATE TABLE rss_monitoring_alerts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('source_down', 'high_error_rate', 'low_article_count', 'performance_degradation', 'duplicate_spike')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    affected_sources UUID[], -- Array of source IDs
    metric_values JSONB DEFAULT '{}', -- Specific metrics that triggered alert
    threshold_values JSONB DEFAULT '{}', -- Configured thresholds
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    first_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    detection_count INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- RSS monitoring tables indexes
CREATE INDEX idx_rss_fetch_logs_triggered_by ON rss_fetch_logs(triggered_by, created_at DESC);
CREATE INDEX idx_rss_fetch_logs_status ON rss_fetch_logs(status, created_at DESC);
CREATE INDEX idx_rss_fetch_logs_created_at ON rss_fetch_logs(created_at DESC);
CREATE INDEX idx_rss_fetch_logs_execution_time ON rss_fetch_logs(execution_time_ms DESC);
CREATE INDEX idx_rss_fetch_logs_success_rate ON rss_fetch_logs(successful_sources, total_sources);

-- RSS source fetch logs indexes
CREATE INDEX idx_rss_source_fetch_logs_fetch_log ON rss_source_fetch_logs(fetch_log_id);
CREATE INDEX idx_rss_source_fetch_logs_source ON rss_source_fetch_logs(source_id, created_at DESC);
CREATE INDEX idx_rss_source_fetch_logs_status ON rss_source_fetch_logs(status, created_at DESC);
CREATE INDEX idx_rss_source_fetch_logs_performance ON rss_source_fetch_logs(execution_time_ms DESC) WHERE status = 'success';

-- RSS monitoring alerts indexes
CREATE INDEX idx_rss_monitoring_alerts_type_severity ON rss_monitoring_alerts(alert_type, severity, is_resolved);
CREATE INDEX idx_rss_monitoring_alerts_unresolved ON rss_monitoring_alerts(is_resolved, severity, created_at DESC) WHERE is_resolved = false;
CREATE INDEX idx_rss_monitoring_alerts_affected_sources ON rss_monitoring_alerts USING gin(affected_sources);
CREATE INDEX idx_rss_monitoring_alerts_detection_count ON rss_monitoring_alerts(detection_count DESC) WHERE is_resolved = false;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on monitoring tables
ALTER TABLE rss_fetch_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_source_fetch_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_monitoring_alerts ENABLE ROW LEVEL SECURITY;

-- RSS Fetch Logs - Admins can see all, editors can read, public no access
CREATE POLICY "rss_fetch_logs_admin_all" ON rss_fetch_logs
    FOR ALL TO news_admin
    USING (true)
    WITH CHECK (true);

CREATE POLICY "rss_fetch_logs_editor_read" ON rss_fetch_logs
    FOR SELECT TO news_editor
    USING (true);

-- RSS Source Fetch Logs - Follow same pattern
CREATE POLICY "rss_source_fetch_logs_admin_all" ON rss_source_fetch_logs
    FOR ALL TO news_admin
    USING (true)
    WITH CHECK (true);

CREATE POLICY "rss_source_fetch_logs_editor_read" ON rss_source_fetch_logs
    FOR SELECT TO news_editor
    USING (true);

-- RSS Monitoring Alerts - Admins full access, editors read unresolved
CREATE POLICY "rss_monitoring_alerts_admin_all" ON rss_monitoring_alerts
    FOR ALL TO news_admin
    USING (true)
    WITH CHECK (true);

CREATE POLICY "rss_monitoring_alerts_editor_unresolved" ON rss_monitoring_alerts
    FOR SELECT TO news_editor
    USING (is_resolved = false OR severity IN ('high', 'critical'));

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Apply updated_at triggers to monitoring tables
CREATE TRIGGER update_rss_fetch_logs_updated_at BEFORE UPDATE ON rss_fetch_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rss_monitoring_alerts_updated_at BEFORE UPDATE ON rss_monitoring_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-complete RSS fetch logs
CREATE OR REPLACE FUNCTION complete_rss_fetch_log()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-calculate failed_sources when not explicitly set
    IF NEW.failed_sources = 0 AND NEW.total_sources > NEW.successful_sources THEN
        NEW.failed_sources = NEW.total_sources - NEW.successful_sources;
    END IF;
    
    -- Set completed_at when status changes to completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
    END IF;
    
    -- Recalculate execution time if completed_at is set but execution_time_ms is 0
    IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL AND NEW.execution_time_ms = 0 THEN
        NEW.execution_time_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply RSS fetch log completion trigger
CREATE TRIGGER complete_rss_fetch_log_trigger
    BEFORE UPDATE ON rss_fetch_logs
    FOR EACH ROW EXECUTE FUNCTION complete_rss_fetch_log();

-- Function to update alert detection counts
CREATE OR REPLACE FUNCTION update_alert_detection()
RETURNS TRIGGER AS $$
BEGIN
    -- Update last_detected_at and increment count for existing alerts
    NEW.last_detected_at = NOW();
    IF OLD.detection_count IS NOT NULL THEN
        NEW.detection_count = OLD.detection_count + 1;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply alert detection trigger
CREATE TRIGGER update_alert_detection_trigger
    BEFORE UPDATE ON rss_monitoring_alerts
    FOR EACH ROW EXECUTE FUNCTION update_alert_detection();

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to get RSS health metrics
CREATE OR REPLACE FUNCTION get_rss_health_metrics(time_period_hours INTEGER DEFAULT 24)
RETURNS TABLE (
    total_fetches INTEGER,
    successful_fetches INTEGER,
    success_rate DECIMAL(5,2),
    avg_execution_time_ms INTEGER,
    total_articles_fetched INTEGER,
    avg_articles_per_fetch DECIMAL(8,2),
    sources_with_errors INTEGER,
    most_common_error TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_fetches,
        COUNT(CASE WHEN rfl.status = 'completed' THEN 1 END)::INTEGER as successful_fetches,
        (COUNT(CASE WHEN rfl.status = 'completed' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0))::DECIMAL(5,2) as success_rate,
        AVG(rfl.execution_time_ms)::INTEGER as avg_execution_time_ms,
        SUM(rfl.total_articles)::INTEGER as total_articles_fetched,
        AVG(rfl.total_articles)::DECIMAL(8,2) as avg_articles_per_fetch,
        COUNT(DISTINCT CASE WHEN array_length(rfl.errors, 1) > 0 THEN 1 END)::INTEGER as sources_with_errors,
        (
            SELECT unnest(errors) as error_msg
            FROM rss_fetch_logs 
            WHERE created_at >= NOW() - INTERVAL '1 hour' * time_period_hours
            AND array_length(errors, 1) > 0
            GROUP BY error_msg
            ORDER BY COUNT(*) DESC
            LIMIT 1
        ) as most_common_error
    FROM rss_fetch_logs rfl
    WHERE rfl.created_at >= NOW() - INTERVAL '1 hour' * time_period_hours;
END;
$$ language 'plpgsql';

-- Function to detect RSS anomalies and create alerts
CREATE OR REPLACE FUNCTION detect_rss_anomalies()
RETURNS INTEGER AS $$
DECLARE
    alert_count INTEGER := 0;
    recent_avg_articles DECIMAL;
    current_articles INTEGER;
    high_error_sources UUID[];
    performance_degraded_sources UUID[];
BEGIN
    -- Check for low article count (50% below recent average)
    SELECT AVG(total_articles) INTO recent_avg_articles
    FROM rss_fetch_logs 
    WHERE created_at >= NOW() - INTERVAL '7 days'
    AND status = 'completed';
    
    SELECT total_articles INTO current_articles
    FROM rss_fetch_logs 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF current_articles IS NOT NULL AND recent_avg_articles IS NOT NULL 
       AND current_articles < (recent_avg_articles * 0.5) THEN
        INSERT INTO rss_monitoring_alerts (
            alert_type, severity, title, description,
            metric_values, threshold_values
        ) VALUES (
            'low_article_count', 'medium',
            'Low Article Count Detected',
            'Current fetch returned significantly fewer articles than recent average',
            jsonb_build_object('current_articles', current_articles, 'recent_avg', recent_avg_articles),
            jsonb_build_object('threshold_percentage', 50)
        );
        alert_count := alert_count + 1;
    END IF;
    
    -- Check for sources with high error rates (>50% failures in last 24h)
    SELECT ARRAY_AGG(source_id) INTO high_error_sources
    FROM (
        SELECT rsfl.source_id
        FROM rss_source_fetch_logs rsfl
        WHERE rsfl.created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY rsfl.source_id
        HAVING COUNT(CASE WHEN rsfl.status = 'failed' THEN 1 END) * 100.0 / COUNT(*) > 50
        AND COUNT(*) >= 3 -- At least 3 attempts
    ) subq;
    
    IF array_length(high_error_sources, 1) > 0 THEN
        INSERT INTO rss_monitoring_alerts (
            alert_type, severity, title, description,
            affected_sources, threshold_values
        ) VALUES (
            'high_error_rate', 'high',
            'High Error Rate on RSS Sources',
            'Multiple sources experiencing >50% failure rate in last 24 hours',
            high_error_sources,
            jsonb_build_object('error_rate_threshold', 50, 'time_window_hours', 24)
        );
        alert_count := alert_count + 1;
    END IF;
    
    -- Check for performance degradation (>3x slower than average)
    SELECT ARRAY_AGG(source_id) INTO performance_degraded_sources
    FROM (
        SELECT rsfl.source_id
        FROM rss_source_fetch_logs rsfl
        WHERE rsfl.created_at >= NOW() - INTERVAL '1 hour'
        AND rsfl.status = 'success'
        GROUP BY rsfl.source_id
        HAVING AVG(rsfl.execution_time_ms) > (
            SELECT AVG(execution_time_ms) * 3
            FROM rss_source_fetch_logs rsfl2
            WHERE rsfl2.source_id = rsfl.source_id
            AND rsfl2.created_at >= NOW() - INTERVAL '7 days'
            AND rsfl2.status = 'success'
        )
    ) subq;
    
    IF array_length(performance_degraded_sources, 1) > 0 THEN
        INSERT INTO rss_monitoring_alerts (
            alert_type, severity, title, description,
            affected_sources, threshold_values
        ) VALUES (
            'performance_degradation', 'medium',
            'RSS Source Performance Degradation',
            'Sources taking significantly longer to fetch than usual',
            performance_degraded_sources,
            jsonb_build_object('performance_multiplier', 3, 'comparison_days', 7)
        );
        alert_count := alert_count + 1;
    END IF;
    
    RETURN alert_count;
END;
$$ language 'plpgsql';

-- Function to clean old RSS logs (keep last 30 days of detailed logs, 1 year of summary logs)
CREATE OR REPLACE FUNCTION cleanup_rss_logs()
RETURNS TABLE(
    deleted_source_logs INTEGER,
    deleted_fetch_logs INTEGER,
    resolved_old_alerts INTEGER
) AS $$
DECLARE
    deleted_source_count INTEGER;
    deleted_fetch_count INTEGER;
    resolved_alerts_count INTEGER;
BEGIN
    -- Delete detailed source fetch logs older than 30 days
    DELETE FROM rss_source_fetch_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS deleted_source_count = ROW_COUNT;
    
    -- Delete detailed fetch logs older than 1 year (keep summary data)
    DELETE FROM rss_fetch_logs 
    WHERE created_at < NOW() - INTERVAL '1 year';
    GET DIAGNOSTICS deleted_fetch_count = ROW_COUNT;
    
    -- Auto-resolve old alerts (older than 7 days and not critical)
    UPDATE rss_monitoring_alerts 
    SET is_resolved = true,
        resolved_at = NOW(),
        resolution_notes = 'Auto-resolved: No activity for 7 days'
    WHERE is_resolved = false
    AND severity != 'critical'
    AND last_detected_at < NOW() - INTERVAL '7 days';
    GET DIAGNOSTICS resolved_alerts_count = ROW_COUNT;
    
    RETURN QUERY SELECT deleted_source_count, deleted_fetch_count, resolved_alerts_count;
END;
$$ language 'plpgsql';

-- =====================================================
-- SAMPLE QUERIES FOR MONITORING DASHBOARD
-- =====================================================

-- Get recent RSS fetch performance
-- SELECT * FROM get_rss_health_metrics(24);

-- Get active alerts
-- SELECT alert_type, severity, title, affected_sources, created_at 
-- FROM rss_monitoring_alerts 
-- WHERE is_resolved = false 
-- ORDER BY severity DESC, created_at DESC;

-- Get source performance over last 7 days
-- SELECT 
--     ns.name,
--     COUNT(*) as total_attempts,
--     COUNT(CASE WHEN rsfl.status = 'success' THEN 1 END) as successful,
--     AVG(rsfl.execution_time_ms)::INTEGER as avg_time_ms,
--     SUM(rsfl.articles_added) as total_articles_added
-- FROM rss_source_fetch_logs rsfl
-- JOIN news_sources ns ON rsfl.source_id = ns.id
-- WHERE rsfl.created_at >= NOW() - INTERVAL '7 days'
-- GROUP BY ns.id, ns.name
-- ORDER BY successful::DECIMAL / COUNT(*) DESC;