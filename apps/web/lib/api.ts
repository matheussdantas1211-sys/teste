import { mockData } from '@/lib/mock-data';
import { DashboardData } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getDashboardData(): Promise<DashboardData> {
  if (!API_URL) {
    return mockData;
  }

  try {
    const response = await fetch(`${API_URL}/dashboard/overview`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return mockData;
    }

    return (await response.json()) as DashboardData;
  } catch {
    return mockData;
  }
}
