import { fetchJson } from "@/shared/api/services/_shared";
import type { StudentDashboard } from "../model/student.schema";

export const studentApi = {
  getDashboard: async (): Promise<StudentDashboard> => {
    return fetchJson<StudentDashboard>("/api/student/dashboard");
  },
};
