import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const secretKey     = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);
  const body   = await req.text();
  const sig    = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session  = event.data.object as Stripe.Checkout.Session;
    const meta     = session.metadata ?? {};
    const amount   = (session.amount_total ?? 0) / 100;

    // Retrieve line items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 50 });
    const itemsList = lineItems.data.map(i => `${i.quantity}x ${i.description} — $${((i.amount_total ?? 0)/100).toFixed(2)}`).join("\n");

    // Send admin email via EmailJS REST API (no browser needed)
    const serviceId  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE;
    const userId     = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (serviceId && templateId && userId) {
      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id:  serviceId,
          template_id: templateId,
          user_id:     userId,
          template_params: {
            order_id:         meta.order_id || session.id,
            customer_name:    meta.name    || session.customer_email,
            customer_email:   session.customer_email,
            customer_phone:   meta.phone   || "—",
            shipping_address: `${meta.address}, ${meta.city}, ${meta.state} ${meta.zip}, ${meta.country}`,
            items_list:       itemsList,
            order_total:      `$${amount.toFixed(2)}`,
            order_notes:      meta.notes || "—",
            to_email:         "admin@kareembaksh.com",
          },
        }),
      }).catch(() => {});
    }
  }

  return NextResponse.json({ received: true });
}
