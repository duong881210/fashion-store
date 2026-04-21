import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // VNPAY return logic will be here
  return NextResponse.json({ message: 'VNPAY return' });
}
