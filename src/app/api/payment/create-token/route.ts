import { NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { db } from "../../../../lib/db";
import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: false, // ganti true saat production
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await req.json();

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, user: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  }

  const parameter = {
    transaction_details: {
      order_id: order.orderNumber,
      gross_amount: order.totalPrice,
    },
    customer_details: {
      first_name: order.user.name,
      email: order.user.email,
    },
    item_details: order.items.map((item) => ({
      id: item.productId,
      price: item.price,
      quantity: item.quantity,
      name: item.product.name,
    })),
  };

  const transaction = await snap.createTransaction(parameter);

  // Simpan snap token ke database
  await db.payment.update({
    where: { orderId },
    data: { snapToken: transaction.token },
  });

  return NextResponse.json({ token: transaction.token });
}