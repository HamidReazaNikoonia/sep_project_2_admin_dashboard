export interface Transaction {
    tax: number;
    status: boolean;
    _id: string;
    order_id: string;
    amount: number;
    factorNumber: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    payment_details?: {
        code: number,
        message: string,
        card_hash: string,
        card_pan: string,
        fee_type: string,
        fee: number,
        shaparak_fee: number
    },
}