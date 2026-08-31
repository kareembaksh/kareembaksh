import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getProductsServer } from "@/lib/serverProducts";
import { loadPromosFS } from "@/lib/firestore";

export async function POST(req: NextRequest) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = new Stripe(secretKey);
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kareembaksh.com";

  try {
    const { items, customer, orderId } = await req.json();

    // 1. Fetch live products and promos from Firebase (Server-Side)
    const [allProducts, allPromos] = await Promise.all([
      getProductsServer(),
      loadPromosFS()
    ]);

    // 2. Validate Promo Code
    let serverDiscount = 0;
    let promoType = "percent";
    const promoCode = customer.promo?.trim().toUpperCase();
    if (promoCode) {
      const promo = allPromos.find(p => p.code === promoCode && p.active);
      if (promo) {
        serverDiscount = promo.value;
        promoType = promo.type;
      }
    }
    
    // Apply discount factor across all line items (percent only for now)
    const factor = (promoType === "percent" && serverDiscount > 0) ? (1 - serverDiscount / 100) : 1;

    // 3. Build line items securely based on SERVER prices, ignoring client prices
    const lineItems: Stripe.Checkout.SessionCreateParams["line_items"] = items.map((clientItem: any) => {
      const serverProduct = allProducts.find(p => p.id === clientItem.id);
      
      if (!serverProduct) {
        throw new Error(`Product not found: ${clientItem.name || clientItem.id}`);
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: serverProduct.name,
            images: serverProduct.image?.startsWith("http") ? [serverProduct.image] : [],
          },
          unit_amount: Math.round(serverProduct.price * factor * 100),
        },
        quantity: clientItem.quantity,
      };
    });

    // 4. Create Stripe Session
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
        promo:      promoCode || "",
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
