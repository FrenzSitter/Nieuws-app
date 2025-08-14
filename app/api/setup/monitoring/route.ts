import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    
    // First, let's create the rss_fetch_logs table
    const createFetchLogsTable = `
      CREATE TABLE IF NOT EXISTS rss_fetch_logs (
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
        trigger_metadata JSONB DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed', 'partial')),
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMPTZ,
        source_details JSONB DEFAULT '{}',
        performance_metrics JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `

    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: createFetchLogsTable
    })

    if (tableError) {
      console.error('Error creating rss_fetch_logs table:', tableError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create rss_fetch_logs table',
        details: tableError.message
      }, { status: 500 })
    }

    // Create indexes
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_rss_fetch_logs_created_at ON rss_fetch_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_rss_fetch_logs_status ON rss_fetch_logs(status, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_rss_fetch_logs_triggered_by ON rss_fetch_logs(triggered_by, created_at DESC);
    `

    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: createIndexes
    })

    if (indexError) {
      console.warn('Error creating indexes:', indexError)
    }

    // Test the table by inserting a sample log
    const { error: insertError } = await supabase
      .from('rss_fetch_logs')
      .insert({
        total_sources: 5,
        successful_sources: 5,
        total_articles: 0,
        execution_time_ms: 1000,
        triggered_by: 'manual',
        status: 'completed'
      })

    if (insertError) {
      console.error('Error testing table insert:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Table created but insert test failed',
        details: insertError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'RSS monitoring tables created successfully',
      tables_created: ['rss_fetch_logs'],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Setup monitoring API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to setup monitoring tables',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = createServiceClient()
    
    // Check if monitoring tables exist
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['rss_fetch_logs', 'rss_source_fetch_logs', 'rss_monitoring_alerts'])

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to check table existence',
        details: error.message
      }, { status: 500 })
    }

    const existingTables = tables?.map(t => t.table_name) || []

    return NextResponse.json({
      success: true,
      existing_tables: existingTables,
      missing_tables: ['rss_fetch_logs', 'rss_source_fetch_logs', 'rss_monitoring_alerts'].filter(
        t => !existingTables.includes(t)
      ),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Check monitoring tables error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check monitoring tables'
    }, { status: 500 })
  }
}