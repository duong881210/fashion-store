import { NextResponse, connection } from 'next/server';
import connectDB from '@/server/db';
import mongoose from 'mongoose';


export async function GET() {
  await connection();
  try {
    await connectDB();
    const isConnected = mongoose.connection.readyState === 1;
    
    if (!isConnected) {
      return NextResponse.json({
        status: 'error',
        db: 'disconnected',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[Health Check Error]', error);
    return NextResponse.json({
      status: 'error',
      db: 'disconnected',
      error: error.message || 'Unknown database connection error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
