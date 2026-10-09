'use server';

import { testConnection } from '@/lib/db';

export async function getDbStatus(): Promise<boolean> {
  return await testConnection();
}
