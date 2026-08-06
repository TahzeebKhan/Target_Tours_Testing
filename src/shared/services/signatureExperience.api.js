import api from "./axios";

export const fetchSignatureExperiences = async (region) => {
  const res = await api.get(
    "/signature-experience/company",
    {
      params: {
        region,
        domain: process.env.NEXT_PUBLIC_DOMAIN,
      },
      
    }
  );

  return res.data;
};
