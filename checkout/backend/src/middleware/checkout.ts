


export const validateCheckoutData = (request: any, reply: any, done: any) => {
  const { items, paymentMethod } = request.body;

  // Validate that items is an array and not empty
  if (!Array.isArray(items) || items.length === 0) {
    reply.status(400).send({ error: 'Items must be a non-empty array' });
    return;
  }

  // Validate that paymentMethod is a string and not empty
  if (typeof paymentMethod !== 'string' || paymentMethod.trim() === '') {
    reply.status(400).send({ error: 'Payment method must be a non-empty string' });
    return;
  }

  // If validation passes, call the done callback to proceed to the next middleware or route handler
  done();
}