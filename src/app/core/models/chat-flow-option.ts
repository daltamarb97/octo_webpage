export interface ChatFlowOption {
        option:Array<option> 
        email:string;
        phone:number;
        amountToPay:number;
        timelyPayment:any;
    }
    
export interface option {
        message:string;
        amountToPay:number;
        timelyPayment:any;
    }
