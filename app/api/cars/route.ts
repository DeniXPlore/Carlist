import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('_page') || '1';
  const limit = '12';
  const sort = searchParams.get('_sort') || '';
  const order = searchParams.get('_order') || '';

  const apiUrl = `https://testing-api.ru-rating.ru/cars?_limit=${limit}&_page=${page}${sort ? `&_sort=price&_order=${order}` : ''}`;
  try {
    const response = await fetch(apiUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error('Ошибка запроса к API');
    const data = await response.json();
    console.log('API Data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Ошибка:', error);
    return NextResponse.json({ data: [], meta: { currentPage: parseInt(page), totalPages: 1 } }, { status: 500 });
  }
}