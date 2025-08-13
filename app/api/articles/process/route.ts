import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST() {
  try {
    const supabase = createServiceClient()
    
    // Update all pending articles to processed
    const { data, error } = await supabase
      .from('raw_articles')
      .update({ processing_status: 'processed' })
      .eq('processing_status', 'pending')
      .select('id, title')
    
    if (error) {
      console.error('Error processing articles:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${data?.length || 0} articles`,
      processedArticles: data?.length || 0
    })

  } catch (error) {
    console.error('Process articles API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}