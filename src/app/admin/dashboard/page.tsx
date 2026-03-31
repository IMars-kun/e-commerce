import { db } from "../../../lib/db";
import { formatRupiah } from "../../../lib/utils";

export default async function DashboardPage() {
  const [totalOrders, totalRevenue, totalProducts, totalUsers] =
    await Promise.all([
      db.order.count(),
      db.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      db.product.count({ where: { isActive: true } }),
      db.user.count({ where: { role: "USER" } }),
    ]);

  const stats = [
    { label: "Total Pesanan", value: totalOrders },
    { label: "Pendapatan", value: formatRupiah(totalRevenue._sum.amount ?? 0) },
    { label: "Produk Aktif", value: totalProducts },
    { label: "Total User", value: totalUsers },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border rounded-xl p-5">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-semibold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}