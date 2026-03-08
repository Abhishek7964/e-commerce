import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createOrder } from "@/lib/orders";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { cartItems } = await request.json();

    if (!cartItems || cartItems.length === 0) {
      return new Response(
        JSON.stringify({ error: "Cart is empty" }),
        { status: 400 }
      );
    }

    // Create the order
    const order = createOrder(session.user.email, cartItems);

    return new Response(
      JSON.stringify({
        success: true,
        order,
        message: "Order placed successfully!",
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create order" }),
      { status: 500 }
    );
  }
}
