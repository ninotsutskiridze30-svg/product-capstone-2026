import { queryOptions, useQuery } from "@tanstack/react-query";
import { studentApi } from "./student.api";

export const studentKeys = {
  all: ["student"] as const,
  dashboard: () => [...studentKeys.all, "dashboard"] as const,
};

export const studentDashboardQueryOptions = () =>
  queryOptions({
    queryKey: studentKeys.dashboard(),
    queryFn: () => studentApi.getDashboard(),
  });

export const useStudentDashboard = () =>
  useQuery(studentDashboardQueryOptions());
