const { GoogleGenerativeAI } = require('@google/generative-ai');
const InventoryItem = require('../models/InventoryItem');
const StockTransaction = require('../models/StockTransaction');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get historical sales data for an item
 */
const getHistoricalSalesData = async (itemId, days = 90) => {
  try {
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - days);

    const transactions = await StockTransaction.find({
      itemId,
      type: 'out',
      reason: 'sale',
      transactionDate: { $gte: dateFilter },
    }).sort({ transactionDate: 1 });

    // Group by day
    const salesByDay = new Map();
    transactions.forEach((t) => {
      const date = new Date(t.transactionDate).toISOString().split('T')[0];
      if (!salesByDay.has(date)) {
        salesByDay.set(date, 0);
      }
      salesByDay.set(date, salesByDay.get(date) + t.quantity);
    });

    return Array.from(salesByDay.entries()).map(([date, quantity]) => ({
      date,
      quantity,
    }));
  } catch (error) {
    throw new Error(`Error fetching historical data: ${error.message}`);
  }
};

/**
 * Simple Moving Average forecast
 */
const calculateSimpleMovingAverage = (data, period = 7) => {
  if (data.length < period) {
    return data.reduce((sum, item) => sum + item.quantity, 0) / data.length;
  }

  const recentData = data.slice(-period);
  return recentData.reduce((sum, item) => sum + item.quantity, 0) / period;
};

/**
 * Forecast demand using Gemini AI
 */
const forecastDemandWithGemini = async (itemId, forecastDays = 30) => {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in .env file');
    }

    // Get item details
    const item = await InventoryItem.findById(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    // Get historical data (last 90 days)
    const historicalData = await getHistoricalSalesData(itemId, 90);

    if (historicalData.length === 0) {
      return {
        itemId: item._id,
        itemName: item.name,
        sku: item.sku,
        forecastMethod: 'no-data',
        message: 'No historical sales data available for forecasting',
        predictedDemand: 0,
        recommendedReorder: 0,
        confidence: 'low',
      };
    }

    // Calculate basic statistics
    const totalSales = historicalData.reduce((sum, d) => sum + d.quantity, 0);
    const avgDailySales = totalSales / historicalData.length;
    const sma7 = calculateSimpleMovingAverage(historicalData, 7);
    const sma30 = calculateSimpleMovingAverage(historicalData, 30);

    // Prepare data for Gemini
    const recentSales = historicalData.slice(-30); // Last 30 days

    const prompt = `You are an inventory forecasting expert. Analyze the following sales data and provide a demand forecast.

Item Details:
- Name: ${item.name}
- SKU: ${item.sku}
- Category: ${item.category}
- Current Stock: ${item.quantity} ${item.unit}
- Reorder Level: ${item.reorderLevel} ${item.unit}

Historical Sales Data (Last ${historicalData.length} days):
${JSON.stringify(recentSales, null, 2)}

Statistics:
- Total Sales (${historicalData.length} days): ${totalSales} ${item.unit}
- Average Daily Sales: ${avgDailySales.toFixed(2)} ${item.unit}
- 7-Day Moving Average: ${sma7.toFixed(2)} ${item.unit}
- 30-Day Moving Average: ${sma30.toFixed(2)} ${item.unit}

Based on this data, provide a forecast for the next ${forecastDays} days. Return ONLY a valid JSON object with the following structure (no markdown, no code blocks):
{
  "predictedDemand": <number - predicted total demand for next ${forecastDays} days>,
  "dailyAverageForecast": <number - predicted average daily demand>,
  "confidence": "<low|medium|high>",
  "trend": "<increasing|stable|decreasing>",
  "seasonalityDetected": <boolean>,
  "recommendedReorderQuantity": <number - suggested reorder quantity>,
  "recommendedReorderPoint": <number - when to reorder (stock level)>,
  "insights": "<brief explanation of the forecast>",
  "risks": "<potential risks or considerations>"
}`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let forecast;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      forecast = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      // Fallback to simple forecast
      forecast = {
        predictedDemand: Math.round(avgDailySales * forecastDays),
        dailyAverageForecast: avgDailySales,
        confidence: 'medium',
        trend: 'stable',
        seasonalityDetected: false,
        recommendedReorderQuantity: Math.max(item.reorderLevel, Math.round(avgDailySales * 14)),
        recommendedReorderPoint: item.reorderLevel,
        insights: 'Forecast based on historical average due to AI response parsing issue.',
        risks: 'Limited historical data may affect accuracy.',
      };
    }

    return {
      itemId: item._id,
      itemName: item.name,
      sku: item.sku,
      category: item.category,
      currentStock: item.quantity,
      reorderLevel: item.reorderLevel,
      unit: item.unit,
      forecastPeriod: `${forecastDays} days`,
      forecastMethod: 'gemini-ai',
      historicalDataPoints: historicalData.length,
      statistics: {
        totalSales,
        avgDailySales: avgDailySales.toFixed(2),
        sma7: sma7.toFixed(2),
        sma30: sma30.toFixed(2),
      },
      forecast,
      generatedAt: new Date(),
    };
  } catch (error) {
    throw new Error(`Error forecasting with Gemini: ${error.message}`);
  }
};

/**
 * Get AI-powered restock suggestions using Gemini
 */
const getRestockSuggestions = async (naturalLanguageQuery) => {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key not configured');
    }

    // Get current inventory status
    const lowStockItems = await InventoryItem.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
      status: 'active',
    }).limit(20);

    const allItems = await InventoryItem.find({ status: 'active' }).limit(50);

    // Get recent sales trends
    const recentSales = await StockTransaction.aggregate([
      {
        $match: {
          type: 'out',
          reason: 'sale',
          transactionDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: '$itemId',
          totalSold: { $sum: '$quantity' },
          avgDailyRate: { $avg: '$quantity' },
        },
      },
      {
        $lookup: {
          from: 'inventoryitems',
          localField: '_id',
          foreignField: '_id',
          as: 'item',
        },
      },
      { $unwind: '$item' },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    const prompt = `You are an inventory management AI assistant. A user has asked: "${naturalLanguageQuery}"

Current Inventory Status:
Low Stock Items (${lowStockItems.length}):
${lowStockItems
        .map(
          (item) =>
            `- ${item.name} (${item.sku}): ${item.quantity}/${item.reorderLevel} ${item.unit}, Value: ₹${item.stockValue}`
        )
        .join('\n')}

Top Selling Items (Last 30 days):
${recentSales
        .map(
          (s) =>
            `- ${s.item.name} (${s.item.sku}): Sold ${s.totalSold} ${s.item.unit}, Current Stock: ${s.item.quantity}`
        )
        .join('\n')}

Total Active Items: ${allItems.length}

Provide a helpful, actionable response to the user's query. 

**FORMAT YOUR RESPONSE AS FOLLOWS:**

1. Use numbered lists (1. 2. 3.) for sequential items or recommendations
2. Use bullet points (-) for non-sequential information
3. Use **bold text** for important terms, item names, or key metrics
4. Use clear section headers followed by colon (:) for organizing different topics
5. Keep paragraphs short and concise (2-3 sentences max)

Include in your response:
- Direct answer to their question
- Specific item recommendations with quantities
- Priority levels (🔴 High / 🟡 Medium / 🟢 Low)
- Estimated costs if relevant
- Any risks or considerations

Make the response clear, actionable, and well-structured.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestion = response.text();

    return {
      query: naturalLanguageQuery,
      response: suggestion,
      context: {
        lowStockCount: lowStockItems.length,
        topSellingItemsAnalyzed: recentSales.length,
        totalActiveItems: allItems.length,
      },
      generatedAt: new Date(),
    };
  } catch (error) {
    throw new Error(`Error generating restock suggestions: ${error.message}`);
  }
};

/**
 * Batch forecast for multiple items
 */
const batchForecast = async (category = null, limit = 10) => {
  try {
    const filter = { status: 'active' };
    if (category) filter.category = category;

    // Get items with recent sales activity
    const recentSales = await StockTransaction.aggregate([
      {
        $match: {
          type: 'out',
          reason: 'sale',
          transactionDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: '$itemId',
          totalSold: { $sum: '$quantity' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
    ]);

    const itemIds = recentSales.map((s) => s._id);
    const items = await InventoryItem.find({ _id: { $in: itemIds } });

    // Simple forecasts for batch (without Gemini to avoid rate limits)
    const forecasts = await Promise.all(
      items.map(async (item) => {
        const historicalData = await getHistoricalSalesData(item._id, 30);
        const totalSales = historicalData.reduce((sum, d) => sum + d.quantity, 0);
        const avgDailySales = historicalData.length > 0 ? totalSales / historicalData.length : 0;
        const predictedDemand = Math.round(avgDailySales * 30);
        const recommendedReorder = Math.max(
          item.reorderLevel,
          Math.round(avgDailySales * 14)
        );

        return {
          itemId: item._id,
          itemName: item.name,
          sku: item.sku,
          category: item.category,
          currentStock: item.quantity,
          reorderLevel: item.reorderLevel,
          predictedDemand30Days: predictedDemand,
          recommendedReorderQuantity: recommendedReorder,
          avgDailySales: avgDailySales.toFixed(2),
          needsRestock: item.quantity <= item.reorderLevel,
        };
      })
    );

    return {
      totalItems: forecasts.length,
      category: category || 'all',
      forecasts,
      generatedAt: new Date(),
    };
  } catch (error) {
    throw new Error(`Error in batch forecast: ${error.message}`);
  }
};

module.exports = {
  getHistoricalSalesData,
  forecastDemandWithGemini,
  getRestockSuggestions,
  batchForecast,
};
