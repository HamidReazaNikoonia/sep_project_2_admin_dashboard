import axios from  '../axios';

const transactionApi = {
  getTransactions: async (params?: { page?: number; limit?: number; q?: string; id?: string | number }) => {
    const { data } = await axios.get<{ data: any[] }>('transaction/admin', {params});
    return data;
  },
};

export default transactionApi;