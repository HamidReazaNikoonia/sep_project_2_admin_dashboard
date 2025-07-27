import axios from  '../axios';

const siteInfoApi = {
  getCitiesByProvinceId: async (provinceId: string) => {
    const { data } = await axios.get<{ data: any[] }>(`/site-info/provinces/${provinceId}/cities`);
    return data;
  },
  getProvinces: async () => {
    const { data } = await axios.get<{ data: any[] }>(`/site-info/provinces`);
    return data;
  },
};

export default siteInfoApi;