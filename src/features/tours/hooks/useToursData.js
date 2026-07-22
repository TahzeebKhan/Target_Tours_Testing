export const useToursData = ({ data }) => {
  const tourData = data?.pages?.flatMap((page) => page.data) || [];
  const meta = data?.pages?.[0]?.meta;

  return { tourData, meta };
};
