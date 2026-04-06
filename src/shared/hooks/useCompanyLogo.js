"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCompanyPublicInfo } from "@/shared/services/companyPublicInfo";

const toAbsoluteLogoUrl = (value) => {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;

  const backendUrl = String(process.env.NEXT_PUBLIC_BACKEND_URL || "").trim();
  return backendUrl ? `${backendUrl}${url}` : url;
};

export const useCompanyLogo = () => {
  const query = useQuery({
    queryKey: ["company-public-info", process.env.NEXT_PUBLIC_DOMAIN],
    queryFn: fetchCompanyPublicInfo,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const logoUrl = toAbsoluteLogoUrl(query.data?.company?.logo?.url);

  return {
    ...query,
    logoUrl,
  };
};
