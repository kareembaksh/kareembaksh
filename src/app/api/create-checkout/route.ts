import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kareembaksh.com";

  try {
    const { items, customer, orderId, discount } = await req.json();

    // Apply discount factor across all line items
    const factor = discount > 0 ? (1 - discount / 100) : 1;

    const lineItems: Stripe.Checkout.SessionCreateParams["line_items"] = items.map((item: {
      name: string; price: number; quantity: number; image: string;
    }) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image?.startsWith("http") ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * factor * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customer.email,
      line_items: lineItems,
      metadata: {
        order_id:   orderId,
        name:       customer.name,
        phone:      customer.phone,
        address:    customer.address,
        city:       customer.city,
        state:      customer.state,
        zip:        customer.zip,
        country:    customer.country,
        notes:      customer.notes || "",
        promo:      customer.promo || "",
      },
      success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${base}/checkout`,
      billing_address_collection: "required",
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
