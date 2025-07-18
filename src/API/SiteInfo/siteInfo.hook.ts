import { useQuery } from '@tanstack/react-query';
import siteInfoApi from './siteInfo.api';

// Query keys
export const siteInfoKeys = {
  all: ['siteInfo'] as const,
  cities: () => [...siteInfoKeys.all, 'cities'] as const,
  citiesByProvince: (provinceId: string) => [...siteInfoKeys.cities(), provinceId] as const,
};

// Get cities by province ID
export const useCitiesByProvinceId = (provinceId: string) => {
  return useQuery({
    queryKey: siteInfoKeys.citiesByProvince(provinceId),
    queryFn: () => siteInfoApi.getCitiesByProvinceId(provinceId),
    enabled: !!provinceId, // Only run query if provinceId is provided
  });
};
