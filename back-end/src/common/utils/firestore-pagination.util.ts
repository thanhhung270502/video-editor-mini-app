import type { Query } from "firebase-admin/firestore";
import type {
  PageableResponse,
  PaginationQueryParams,
} from "../types/pagination";

export const paginateFirestoreQuery = async <T>(
  query: Query,
  params: PaginationQueryParams,
  mapper: (doc: FirebaseFirestore.QueryDocumentSnapshot) => T
): Promise<PageableResponse<T>> => {
  const { limit, offset } = params;

  const countSnapshot = await query.count().get();
  const total_record = countSnapshot.data().count;

  if (limit === 0) {
    return { total_record, data: [] };
  }

  let paginatedQuery: Query = query;

  if (offset > 0) {
    const skipSnapshot = await query.limit(offset).get();
    const lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
    if (!lastDoc) {
      return { total_record, data: [] };
    }
    paginatedQuery = query.startAfter(lastDoc);
  }

  const snapshot = await paginatedQuery.limit(limit).get();
  const data = snapshot.docs.map(mapper);

  return { total_record, data };
};
