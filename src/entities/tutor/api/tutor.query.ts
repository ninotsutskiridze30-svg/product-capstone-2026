import { queryOptions, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type { TutorFilters } from "@/shared/lib/query-keys";
import { tutorApi } from "./tutor.api";

export const tutorKeys = {
  all: ["tutors"] as const,
  list: (filters?: TutorFilters) => [...tutorKeys.all, "list", filters] as const,
  detail: (id: string) => [...tutorKeys.all, "detail", id] as const,
  dashboard: () => [...tutorKeys.all, "dashboard"] as const,
  infinite: () => [...tutorKeys.all, "infinite"] as const,
};

export const tutorListQueryOptions = (filters?: TutorFilters) =>
  queryOptions({
    queryKey: tutorKeys.list(filters),
    queryFn: () => tutorApi.getList(filters ?? {}),
  });

export const tutorDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: tutorKeys.detail(id),
    queryFn: () => tutorApi.getById(id),
  });

export const tutorDashboardQueryOptions = () =>
  queryOptions({
    queryKey: tutorKeys.dashboard(),
    queryFn: () => tutorApi.getDashboard(),
  });

export const useTutorList = (filters?: TutorFilters) =>
  useQuery(tutorListQueryOptions(filters));

export const useTutorDetail = (id: string) =>
  useQuery(tutorDetailQueryOptions(id));

export const useTutorDashboard = () =>
  useQuery(tutorDashboardQueryOptions());

export function useTutorListInfinite() {
  return useInfiniteQuery({
    queryKey: tutorKeys.infinite(),
    queryFn: ({ pageParam }) =>
      tutorApi.getList({ page: pageParam as number, limit: 12 }),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.length * lastPage.limit;
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
