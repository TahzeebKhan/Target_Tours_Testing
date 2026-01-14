import { useQuery } from "@tanstack/react-query";
import { fetchSignatureExperiences } from "../service/signatureExperience.api";

export const useSignatureExperience = (region) => {
  return useQuery({
    queryKey: ["signature-experience", region],
    queryFn: () => fetchSignatureExperiences(region),
    enabled: !!region,            // 🛑 region null ho to call nahi
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
};
