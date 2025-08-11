import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM wishes ORDER BY created_at DESC'
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch wishes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Wish text is required' }, { status: 400 });
    }

    const result = await pool.query(
      'INSERT INTO wishes (text, created_at, ip_hash) VALUES ($1, NOW(), $2) RETURNING *',
      [text.trim(), 'hashed-ip'] // You can implement proper IP hashing later
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to create wish' }, { status: 500 });
  }
}
