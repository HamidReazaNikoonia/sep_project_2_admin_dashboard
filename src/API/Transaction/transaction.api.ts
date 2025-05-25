import axios from  '../axios';

const transactionApi = {
  getTransactions: async (params?: { page?: number; limit?: number; q?: string }) => {
    const { data } = await axios.get<{ data: any[] }>('transaction/admin', {params});
    return data;
  },
};

export default transactionApi;