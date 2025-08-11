import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wishId = searchParams.get('wishId');

    if (!wishId) {
      return NextResponse.json({ error: 'Wish ID is required' }, { status: 400 });
    }

    const result = await pool.query(
      'SELECT * FROM comments WHERE wish_id = $1 ORDER BY created_at ASC',
      [wishId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { wishId, text, founderName } = await request.json();
    
    if (!wishId || !text || !founderName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await pool.query(
      'INSERT INTO comments (wish_id, text, founder_name) VALUES ($1, $2, $3) RETURNING *',
      [wishId, text.trim(), founderName]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
