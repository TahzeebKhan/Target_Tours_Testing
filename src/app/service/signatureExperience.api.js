import api from "./axios";

export const fetchSignatureExperiences = async (region) => {
  const res = await api.get(
    "/signature-experience/company",
    {
      params: { originalRegion: region },
    }
  );

  return res.data;
};
