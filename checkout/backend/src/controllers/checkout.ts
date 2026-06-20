import type { CheckoutRequest } from "../dtos/checkout.dto.ts";

export const checkoutController = async (checkout: CheckoutRequest, reply: any) => {
  
  

  reply.send({ success: true, message: 'Checkout completed successfully' });
}