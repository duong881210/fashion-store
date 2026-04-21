import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // VNPAY create payment logic will be here
  return NextResponse.json({ message: 'VNPAY create payment' });
}
