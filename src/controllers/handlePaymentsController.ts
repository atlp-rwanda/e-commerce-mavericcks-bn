import { Request, Response } from 'express';
import Stripe from 'stripe';
import { config } from 'dotenv';
import { Product } from '../database/models/Product';
import { Size } from '../database/models/Size';
import Order from '../database/models/order';
import { sendInternalErrorResponse } from '../validations';

config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

type Items = {
  id: string;
  sizes: Size[];
}[];

const fetchProducts = async (items: Items) => {
  const products = await Promise.all(
    items.map(async item => {
      return await Product.findAll({
        where: { id: item.id },
        include: {
          model: Size,
          as: 'sizes',
          attributes: ['size', 'price', 'quantity', 'id'],
          where: {
            id: item.sizes.map(size => size.id),
          },
        },
      });
    })
  );
  return products.flat();
};

let productSize: Size;
export const handlePayments = async (req: Request, res: Response) => {
  try {
    const { items } = req.body as { items: Items };
    const { orderId } = req.params;

    const products = await fetchProducts(items);

    const lineItems = [];
    for (const item of items) {
      const product = products.find(p => p.id === item.id);
      if (product) {
        for (const size of item.sizes) {
          productSize = product.sizes.find((s: { id: string }) => s.id === size.id.toString());
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${product.name} (Size: ${productSize.size})`,
              },
              unit_amount: productSize.price * 100,
            },
            quantity: size.quantity,
          });
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.URL_HOST}/success.html`,
      line_items: lineItems,
      cancel_url: `${process.env.URL_HOST}/cancel.html`,
      metadata: {
        orderId,
        items: JSON.stringify(items),
      },
    });

    const url = session.url;
    res.status(200).json({ ok: true, url });
  } catch (err) {
    sendInternalErrorResponse(res, err);
  }
};

const updateStockLevels = async (items: Items) => {
  const products = await fetchProducts(items);
  for (const item of items) {
    const product = products.find(p => p.id === item.id);
    if (product) {
      for (const size of item.sizes) {
        const newQuantity = productSize.quantity - size.quantity;
        await Size.update({ quantity: newQuantity, updatedAt: new Date() }, { where: { id: productSize.id } });
        if (newQuantity <= 0) {
          await Size.update({ available: false }, { where: { id: productSize.id } });
        }
      }
    }
  }
};

declare module 'express-serve-static-core' {
  interface Request {
    rawBody?: Buffer | string;
  }
}

export const handleWebHooks = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody!, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const items = session.metadata?.items;

    if (!orderId) {
      return res.status(400).send('No order ID found in session metadata');
    }
    try {
      // update status of order
      const updatedOrder = await Order.update({ status: 'paid' }, { where: { id: orderId } });
      if (updatedOrder[0] === 0) {
        return res.status(404).send('Order not found or not updated');
      }
      // update stock levels
      await updateStockLevels(JSON.parse(items!));
      res.json({ received: true });
    } catch (err) {
      return sendInternalErrorResponse(res, err);
    }
  } else {
    res.json({ received: true });
  }
};
