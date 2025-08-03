const PurchaseOrder = require('../models/PurchaseOrder');
const Purchase = require('../models/Purchase');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const Customer = require('../models/Customer');

const modelMap = {
  'purchase-orders': PurchaseOrder,
  purchases: Purchase,
  sales: Sale,
  products: Product,
  vendors: Vendor,
  customers: Customer,
};
function generateSummary(module, records) {
  switch (module) {
    case 'purchases': {
      const totalSpent = records.reduce((sum, r) => sum + (r.total || 0), 0);
      const purchasesByVendor = {};

      records.forEach((r) => {
        const vendor = r.vendor || 'Unknown';
        if (!purchasesByVendor[vendor]) {
          purchasesByVendor[vendor] = { count: 0, totalSpent: 0 };
        }
        purchasesByVendor[vendor].count += 1;
        purchasesByVendor[vendor].totalSpent += r.total || 0;
      });

      return {
        totalPurchases: records.length,
        totalSpent,
        averagePurchaseValue: records.length ? totalSpent / records.length : 0,
        purchasesByVendor: Object.entries(purchasesByVendor).map(([vendor, data]) => ({
          _id: vendor,
          ...data,
        })),
      };
    }

    case 'sales': {
      const totalRevenue = records.reduce((sum, r) => sum + (r.total || 0), 0);
      const salesByStatus = {};

      records.forEach((r) => {
        const status = r.status || 'unknown';
        if (!salesByStatus[status]) {
          salesByStatus[status] = { count: 0, revenue: 0 };
        }
        salesByStatus[status].count += 1;
        salesByStatus[status].revenue += r.total || 0;
      });

      return {
        totalSales: records.length,
        totalRevenue,
        averageOrderValue: records.length ? totalRevenue / records.length : 0,
        salesByStatus: Object.entries(salesByStatus).map(([status, data]) => ({
          _id: status,
          ...data,
        })),
      };
    }

    case 'products': {
      return {
        totalProducts: records.length,
        totalSold: records.reduce((sum, r) => sum + (r.totalSold || 0), 0),
        totalRevenue: records.reduce((sum, r) => sum + (r.totalRevenue || 0), 0),
      };
    }

    case 'vendors': {
      return {
        totalVendors: records.length,
        totalOrders: records.reduce((sum, r) => sum + (r.totalOrders || 0), 0),
        totalSpent: records.reduce((sum, r) => sum + (r.totalSpent || 0), 0),
      };
    }

    case 'customers': {
      return {
        totalCustomers: records.length,
        totalOrders: records.reduce((sum, r) => sum + (r.totalOrders || 0), 0),
        totalRevenue: records.reduce((sum, r) => sum + (r.totalSpent || 0), 0),
      };
    }

    case 'purchase-orders': {
      const total = records.reduce((sum, r) => sum + (r.total || 0), 0);
      return {
        totalPurchaseOrders: records.length,
        totalValue: total,
        averageValue: records.length ? total / records.length : 0,
      };
    }

    default:
      return {};
  }
}

const dateFieldMap = {
  'purchase-orders': 'orderDate',
  purchases: 'purchaseDate',
  sales: 'saleDate',
  products: 'createdAt',
  vendors: 'createdAt',
  customers: 'createdAt',
};

const dataKeyMap = {
  'purchase-orders': 'purchaseOrders',
  purchases: 'purchases',
  sales: 'sales',
  products: 'topProducts',
  vendors: 'topVendors',
  customers: 'topCustomers',
};

exports.getReportData = async (req, res) => {
  try {
    const { module } = req.params;
    const { startDate, endDate } = req.query;

    const Model = modelMap[module];
    const dateField = dateFieldMap[module];
    const dataKey = dataKeyMap[module];

    if (!Model || !dataKey) {
      return res.status(400).json({ success: false, message: 'Invalid module' });
    }

    const query = { isDeleted: { $ne: true } };
    if (startDate && endDate && dateField) {
      query[dateField] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const records = await Model.find(query).lean();

    // 🔢 Generate summaries
    const summary = generateSummary(module, records);

    return res.json({
      success: true,
      data: {
        [dataKey]: records,
        summary,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
