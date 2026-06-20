import { checkoutController } from "../controllers/checkout.ts";



async function routes(fastify: any, options: any) {

    fastify.post('/checkout', async (request: any, reply: any) => {
        // Call the checkout controller to handle the request
        await checkoutController(request, reply);

    });
}


export default routes;