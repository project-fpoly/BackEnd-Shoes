import Bill from "../models/Bill";
import ListModel from "../models/dashboard";
import { DashboardValidator } from "../validations/dashboard";
// const List=[
//     {
//       "id": "akajdk092jk09",
//       "name": "doanh số",
//       "type": "bar",
//       "dataId": "abc123"
//     },
//     {
//       "id": "dsads81823hjks",
//       "name": "đơn hàng",
//       "type": "bar",
//       "dataId": "xyz456"
//     }
//   ]
const data = {
  data: [
    {
      config: {
        id: "abc123",
        name: "doanh số bán hàng",
        dataKey: ["Doanh số", "Lợi nhuận"],
      },
      data: [
        {
          name: "doanh số",
          values: [
            {
              time: "2024-03-26",
              value: 100000,
            },
            {
              time: "2024-03-27",
              value: 150000,
            },
          ],
        },
        {
          name: "Lợi nhuận",
          values: [
            {
              time: "2024-03-26",
              value: 130000,
            },
            {
              time: "2024-03-27",
              value: 170000,
            },
          ],
        },
      ],
    },
  ],
};

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
    const { startTime, endTime } = req.query;
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
      const sortedData = Object.entries(dailyTotal)
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
      const sortedData = Object.entries(dailyTotal)
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
