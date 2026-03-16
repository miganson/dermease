import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  getDailySalesReport,
  getInventoryStatusReport,
  getLowStockReport,
  getMonthlySalesReport,
  getOrderStatusReport,
  getPaymentSummaryReport,
  getProductPerformanceReport
} from "../services/report.service.js";

export const getDailySales = asyncHandler(async (_req, res) => {
  return sendSuccess(res, await getDailySalesReport());
});

export const getMonthlySales = asyncHandler(async (_req, res) => {
  return sendSuccess(res, await getMonthlySalesReport());
});

export const getInventoryStatus = asyncHandler(async (_req, res) => {
  return sendSuccess(res, await getInventoryStatusReport());
});

export const getLowStock = asyncHandler(async (_req, res) => {
  return sendSuccess(res, await getLowStockReport());
});

export const getOrderStatus = asyncHandler(async (_req, res) => {
  return sendSuccess(res, await getOrderStatusReport());
});

export const getPaymentSummary = asyncHandler(async (_req, res) => {
  return sendSuccess(res, await getPaymentSummaryReport());
});

export const getProductPerformance = asyncHandler(async (_req, res) => {
  return sendSuccess(res, await getProductPerformanceReport());
});
