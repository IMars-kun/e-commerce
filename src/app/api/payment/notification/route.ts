import { NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import midtransClient from "midtrans-client";

const core = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

export async function POST(req: Request) {
  const body = await req.json();

  // Verifikasi notifikasi dari Midtrans
  const statusResponse = await core.transaction.notification(body);
  const { order_id, transaction_status, fraud_status } = statusResponse;

  const order = await db.order.findUnique({
    where: { orderNumber: order_id },
  });
  if (!order) return NextResponse.json({ ok: false });

  let orderStatus: any = order.status;
  let paymentStatus: any = "UNPAID";

  if (transaction_status === "capture" && fraud_status === "accept") {
    orderStatus = "PAID";
    paymentStatus = "PAID";
  } else if (transaction_status === "settlement") {
    orderStatus = "PAID";
    paymentStatus = "PAID";
  } else if (["cancel", "deny", "expire"].includes(transaction_status)) {
    orderStatus = "CANCELLED";
    paymentStatus = "FAILED";
  }

  await db.order.update({
    where: { id: order.id },
    data: { status: orderStatus },
  });
  await db.payment.update({
    where: { orderId: order.id },
    data: { status: paymentStatus, paidAt: paymentStatus === "PAID" ? new Date() : null },
  });

  return NextResponse.json({ ok: true });
}