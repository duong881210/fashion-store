import { z } from 'zod';
import { router, adminProcedure } from '../middleware';
import { Order } from '../../db/models/Order';
import { Product } from '../../db/models/Product';
import { User } from '../../db/models/User';
import connectDB from '../../db';

export const analyticsRouter = router({
  getDashboardAnalytics: adminProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string()
    }))
    .query(async ({ input }) => {
      await connectDB();
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      end.setHours(23, 59, 59, 999);

      // 1. Revenue & Order Status
      const orders = await Order.find({
        createdAt: { $gte: start, $lte: end }
      }).lean();

      const validOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded');
      
      // Daily Revenue
      const dailyRevenueMap: Record<string, number> = {};
      const cancellationRateMap: Record<string, { total: number; cancelled: number }> = {};
      
      orders.forEach(order => {
        const dateStr = new Date((order as any).createdAt).toISOString().split('T')[0];
        
        // Revenue
        if (order.status !== 'cancelled' && order.status !== 'refunded') {
          dailyRevenueMap[dateStr] = (dailyRevenueMap[dateStr] || 0) + order.total;
        }

        // Cancellation
        if (!cancellationRateMap[dateStr]) {
          cancellationRateMap[dateStr] = { total: 0, cancelled: 0 };
        }
        cancellationRateMap[dateStr].total += 1;
        if (order.status === 'cancelled') {
          cancellationRateMap[dateStr].cancelled += 1;
        }
      });

      const dailyRevenue = Object.entries(dailyRevenueMap).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => a.date.localeCompare(b.date));
      const cancellationRate = Object.entries(cancellationRateMap).map(([date, stats]) => ({
        date,
        rate: stats.total > 0 ? (stats.cancelled / stats.total) * 100 : 0
      })).sort((a, b) => a.date.localeCompare(b.date));

      const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
      const averageOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

      // 2. Fulfillment Metrics (Avg days confirmed -> shipped)
      let totalFulfillmentTime = 0;
      let fulfilledCount = 0;
      orders.forEach(order => {
        if (order.timeline) {
          const confirmedEvent = order.timeline.find(e => e.status === 'confirmed');
          const shippedEvent = order.timeline.find(e => e.status === 'shipping');
          if (confirmedEvent && shippedEvent) {
            const timeDiff = new Date(shippedEvent.timestamp).getTime() - new Date(confirmedEvent.timestamp).getTime();
            totalFulfillmentTime += timeDiff;
            fulfilledCount += 1;
          }
        }
      });
      const avgDaysToShip = fulfilledCount > 0 ? (totalFulfillmentTime / fulfilledCount) / (1000 * 60 * 60 * 24) : 0;

      // 3. Product Performance & Category Revenue
      const categoryRevenueMap: Record<string, number> = {};
      const productPerformanceMap: Record<string, { name: string; sold: number; revenue: number; stock: number }> = {};

      validOrders.forEach(order => {
        order.items.forEach((item: any) => {
          // It's a snapshot, but we can't get category easily without populating or joining. 
          // We'll calculate it from current product data later.
          if (!productPerformanceMap[item.product.toString()]) {
            productPerformanceMap[item.product.toString()] = {
              name: item.productName,
              sold: 0,
              revenue: 0,
              stock: 0 // to be populated
            };
          }
          productPerformanceMap[item.product.toString()].sold += item.quantity;
          productPerformanceMap[item.product.toString()].revenue += (item.quantity * item.price);
        });
      });

      // Fetch all products to get category revenue and stock info
      const products = await Product.find({}).populate('category').lean();
      
      let wellStocked = 0;
      let lowStock = 0;
      let outOfStock = 0;

      products.forEach((prod: any) => {
        const totalStock = prod.variants.reduce((sum: number, v: any) => sum + v.stock, 0);
        
        if (totalStock === 0) outOfStock++;
        else if (totalStock < 10) lowStock++;
        else wellStocked++;

        const perf = productPerformanceMap[prod._id.toString()];
        if (perf) {
          perf.stock = totalStock;
          const catName = prod.category?.name || 'Uncategorized';
          categoryRevenueMap[catName] = (categoryRevenueMap[catName] || 0) + perf.revenue;
        }
      });

      const categoryRevenue = Object.entries(categoryRevenueMap).map(([name, value]) => ({ name, value }));
      const productPerformance = Object.values(productPerformanceMap).sort((a, b) => b.revenue - a.revenue).slice(0, 50); // Top 50

      // 4. Customer Metrics
      const customers = await User.find({ role: 'customer' }).lean();
      
      // Top 10 Customers by LTV (Lifetime Value)
      const allOrders = await Order.find({ status: { $nin: ['cancelled', 'refunded'] } }).lean();
      const customerLtvMap: Record<string, { name: string; email: string; ltv: number; ordersCount: number }> = {};
      
      allOrders.forEach(order => {
        if (!order.customer) return;
        const cid = order.customer.toString();
        if (!customerLtvMap[cid]) {
          customerLtvMap[cid] = { name: order.shippingAddress.fullName, email: 'N/A', ltv: 0, ordersCount: 0 };
        }
        customerLtvMap[cid].ltv += order.total;
        customerLtvMap[cid].ordersCount += 1;
      });

      // Update emails
      customers.forEach((c: any) => {
        if (customerLtvMap[c._id.toString()]) {
          customerLtvMap[c._id.toString()].email = c.email;
          if (!customerLtvMap[c._id.toString()].name) {
            customerLtvMap[c._id.toString()].name = c.name;
          }
        }
      });

      const topCustomers = Object.values(customerLtvMap)
        .sort((a, b) => b.ltv - a.ltv)
        .slice(0, 10);

      // New vs Returning (very simplistic for the current period)
      // New: joined during this period
      const newCustomers = customers.filter((c: any) => {
        const d = new Date(c.createdAt);
        return d >= start && d <= end;
      }).length;
      
      // Active customers in this period
      const activeCustomerIds = new Set(validOrders.map(o => o.customer?.toString()).filter(Boolean));
      const returningCustomers = activeCustomerIds.size - newCustomers; // Approximation

      return {
        revenue: {
          daily: dailyRevenue,
          byCategory: categoryRevenue,
          averageOrderValue
        },
        product: {
          performance: productPerformance,
          inventoryHealth: [
            { name: 'Khỏe mạnh', value: wellStocked, color: '#10b981' },
            { name: 'Sắp hết', value: lowStock, color: '#f59e0b' },
            { name: 'Hết hàng', value: outOfStock, color: '#ef4444' }
          ]
        },
        customer: {
          newVsReturning: [
            { name: 'Khách mới', value: newCustomers },
            { name: 'Khách cũ', value: Math.max(0, returningCustomers) } // Prevent negative if data is skewed
          ],
          topCustomers
        },
        fulfillment: {
          avgDaysToShip,
          cancellationRate
        }
      };
    })
});
