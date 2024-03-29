
export interface order {
    clientName: string;
    clientPhone: number;
    comments: string;
    deliverMode: string;
    deliveryAddress: string;
    order: Array<string>;
    orderCost:string;
    orderId:string;
    packageCost:string;
    paymentMethod:string;
    state:string;
    timestamp:any;
    unseen:boolean;
    cashChange:string;
    whatsappPhone:string;
    id?:string;
    proofTransferPicture?:string;
    discount?: string;
}