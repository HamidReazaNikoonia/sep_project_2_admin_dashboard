import axios from  '../axios';

const siteInfoApi = {
  getCitiesByProvinceId: async (provinceId: string) => {
    const { data } = await axios.get<{ data: any[] }>(`/site-info/provinces/${provinceId}/cities`);
    return data;
  },
};

export default siteInfoApi;