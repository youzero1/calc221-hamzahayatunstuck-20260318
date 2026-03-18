import { NextRequest, NextResponse } from 'next/server';

interface CalculateRequest {
  expression: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CalculateRequest = await request.json();
    const { expression } = body;

    if (!expression || typeof expression !== 'string') {
      return NextResponse.json({ error: 'Invalid expression' }, { status: 400 });
    }

    // Sanitize: only allow numbers, operators, dots, spaces, parentheses
    const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');
    if (!sanitized) {
      return NextResponse.json({ error: 'Invalid expression after sanitization' }, { status: 400 });
    }

    // eslint-disable-next-line no-new-func
    const result = new Function(`'use strict'; return (${sanitized})`)();

    if (typeof result !== 'number' || !isFinite(result)) {
      return NextResponse.json({ result: 'Error', expression: sanitized });
    }

    return NextResponse.json({ result, expression: sanitized });
  } catch {
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 });
  }
}
