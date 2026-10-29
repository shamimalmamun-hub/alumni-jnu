import { getDocument, listDocuments, type Doc } from './db';

/** Find a membership by document id, then by formNo (as typed / upper-cased), transactionId or mobile. */
export async function findMembership(key: string): Promise<Doc | null> {
  const byId = await getDocument('memberships', key).catch(() => null);
  if (byId) return byId;

  const attempts: Record<string, string>[] = [
    { formNo: key },
    { formNo: key.toUpperCase() },
    { transactionId: key },
    { mobile: key },
  ];
  for (const where of attempts) {
    const [match] = await listDocuments('memberships', { where, limit: 1 }).catch(() => []);
    if (match) return match;
  }
  return null;
}
