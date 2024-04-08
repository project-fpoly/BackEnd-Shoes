import Bill from "../models/Bill";
import ListModel from "../models/dashboard";
import { DashboardValidator } from "../validations/dashboard";
// Hàm tính tổng theo tháng
function aggregateByMonth(dailyTotal) {
  const aggregatedTotal = {};
  for (const [date, value] of Object.entries(dailyTotal)) {
    const month = date.split('-').slice(0, 2).join('-');
    if (!aggregatedTotal[month]) {
      aggregatedTotal[month] = 0;
    }
    aggregatedTotal[month] += value;
  }
  return aggregatedTotal;
}

// Hàm tính tổng theo năm
function aggregateByYear(dailyTotal) {
  const aggregatedTotal = {};
  for (const [date, value] of Object.entries(dailyTotal)) {
    const year = date.split('-')[0];
    if (!aggregatedTotal[year]) {
      aggregatedTotal[year] = 0;
    }
    aggregatedTotal[year] += value;
  }
  return aggregatedTotal;
}


export const getList = async (req, res) => {
  try {
    const lists = await ListModel.find();
    res.status(200).json({ data: lists });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};

export const postList = async (req, res) => {
  try {
    const { error } = DashboardValidator.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({
        message: errors,
      });
    }
    const { name, type } = req.body;
    const newList = new ListModel({ name, type });
    const savedList = await newList.save();
    res.status(201).json(savedList);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};

export const getDataChart = async (req, res) => {
  try {
    const { startTime, endTime, type } = req.query; // Thêm type vào đây
    const { id } = req.params;
    const list = await ListModel.findById(id);
    if (!list) {
      return res.status(404).json({ message: "Không tìm thấy danh sách" });
    } else if (list.name === "Doanh số") {
      const config = {
        name: list.name,
        type: list.type,
      };

      const bills = await Bill.find({
        updatedAt: {
          $gte: new Date(startTime),
          $lt: new Date(endTime + "T23:59:59.999Z"),
        },
        isDelivered: "Đã giao hàng",
      });
      const dailyTotal = {};
      bills.forEach((bill) => {
        const date = new Date(bill.updatedAt).toISOString().split("T")[0];
        if (!dailyTotal[date]) {
          dailyTotal[date] = 0;
        }
        dailyTotal[date] += bill.totalPrice;
      });
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const currentDateISO = currentDate.toISOString().split("T")[0];
        if (!dailyTotal[currentDateISO]) {
          dailyTotal[currentDateISO] = 0;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Tính tổng theo loại (ngày, tháng, năm)
      let aggregatedTotal = {};
      if (type === 'day' || !type) {
        aggregatedTotal = dailyTotal;
      } else if (type === 'month') {
        aggregatedTotal = aggregateByMonth(dailyTotal, startTime, endTime);
      } else if (type === 'year') {
        aggregatedTotal = aggregateByYear(dailyTotal);
      }

      const sortedData = Object.entries(aggregatedTotal)
        .map(([time, value]) => ({ time, value }))
        .sort((a, b) => new Date(a.time) - new Date(b.time));

      const data = {
        data: sortedData,
      };

      return res.status(200).json({
        data: [
          {
            config: config,
            data: data,
          },
        ],
      });
    } else if (list.name === "Đơn hàng") {
      const config = {
        name: list.name,
        type: list.type,
      };

      const bills = await Bill.find({
        createdAt: {
          $gte: new Date(startTime),
          $lt: new Date(endTime + "T23:59:59.999Z"),
        },
      });
      console.log(bills);
      const dailyTotal = {};
      bills.forEach((bill) => {
        const date = new Date(bill.createdAt).toISOString().split("T")[0];
        if (!dailyTotal[date]) {
          dailyTotal[date] = 0;
        }
        dailyTotal[date]++;
      });

      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const currentDateISO = currentDate.toISOString().split("T")[0];
        if (!dailyTotal[currentDateISO]) {
          dailyTotal[currentDateISO] = 0;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      let aggregatedTotal = {};
      if (type === 'day' || !type) {
        aggregatedTotal = dailyTotal;
      } else if (type === 'month') {
        aggregatedTotal = aggregateByMonth(dailyTotal, startTime, endTime);
      } else if (type === 'year') {
        aggregatedTotal = aggregateByYear(dailyTotal);
      }

      const sortedData = Object.entries(aggregatedTotal)
        .map(([time, value]) => ({ time, value }))
        .sort((a, b) => new Date(a.time) - new Date(b.time));

      const data = {
        data: sortedData,
      };

      return res.status(200).json({
        data: [
          {
            config: config,
            data: data,
          },
        ],
      });
    } else if (list.name === "Tất cả") {
        const config = {
            name: list.name,
            type: list.type,
        };
    
        const Bills= await Bill.find()
        const totalByStatus = await Bill.aggregate([
            {
                $group: {
                    _id: "$isDelivered",
                    total: { $sum: 1 }
                }
            }
        ]);
    
        const totalRevenue = await Bill.aggregate([
            {
                $match: { isDelivered: "Đã giao hàng" }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalPrice" }
                }
            }
        ]);
    
        const data = {
            totalAllBill:Bills.length,
            totalByStatus: totalByStatus.reduce((acc, curr) => {
                acc[curr._id] = curr.total;
                return acc;
            }, {}),
            totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0
        };
    
        return res.status(200).json({
            data: [
                {
                    config: config,
                    data: data,
                },
            ],
        });    
    } else {
      res.status(500).json({
        message: "Chưa có dạng này",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      name: error.name,
      message: error.message,
    });
  }
};
