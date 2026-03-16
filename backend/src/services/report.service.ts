import { InventoryAdjustmentModel } from "../models/InventoryAdjustment.js";
import { OrderModel } from "../models/Order.js";
import { PaymentTransactionModel } from "../models/PaymentTransaction.js";
import { ProductModel } from "../models/Product.js";

export async function getDashboardSummary() {
  const [totalProducts, pendingOrders, lowStockItems, revenue] = await Promise.all([
    ProductModel.countDocuments({ isActive: true }),
    OrderModel.countDocuments({ status: { $in: ["pending_payment", "paid", "packed", "shipped"] } }),
    ProductModel.countDocuments({
      $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] }
    }),
    OrderModel.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ])
  ]);

  return {
    totalProducts,
    pendingOrders,
    lowStockItems,
    totalRevenue: revenue[0]?.total ?? 0
  };
}

export async function getDailySalesReport() {
  return OrderModel.aggregate([
    {
      $match: {
        paymentStatus: "paid"
      }
    },
    {
      $project: {
        orderId: "$_id",
        customer: "$customer",
        total: "$total",
        paymentStatus: "$paymentStatus",
        date: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        }
      }
    },
    {
      $sort: { date: -1 }
    }
  ]);
}

export async function getMonthlySalesReport() {
  return OrderModel.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        orderCount: { $sum: 1 },
        totalSales: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0]
          }
        },
        paidOrders: {
          $sum: {
            $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0]
          }
        },
        cancelledOrders: {
          $sum: {
            $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0]
          }
        }
      }
    },
    {
      $sort: {
        "_id.year": -1,
        "_id.month": -1
      }
    }
  ]);
}

export async function getInventoryStatusReport() {
  return ProductModel.find().sort({ stockQuantity: 1, name: 1 });
}

export async function getLowStockReport() {
  return ProductModel.find({
    $expr: { $lte: ["$stockQuantity", "$lowStockThreshold"] }
  }).sort({ stockQuantity: 1 });
}

export async function getOrderStatusReport() {
  return OrderModel.find()
    .populate("customer", "fullName")
    .sort({ createdAt: -1 })
    .select("_id customer createdAt paymentStatus status total");
}

export async function getPaymentSummaryReport() {
  return PaymentTransactionModel.find()
    .populate("order", "_id total")
    .sort({ createdAt: -1 })
    .select("reference method amount status createdAt paidAt order");
}

export async function getProductPerformanceReport() {
  return OrderModel.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productName",
        quantitySold: { $sum: "$items.quantity" },
        revenueContribution: { $sum: "$items.lineTotal" }
      }
    },
    { $sort: { revenueContribution: -1 } }
  ]);
}

export async function getInventoryAdjustmentHistory(limit = 100) {
  return InventoryAdjustmentModel.find()
    .populate("product", "name sku")
    .sort({ createdAt: -1 })
    .limit(limit);
}

