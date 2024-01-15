import Bill from "../models/Bill";
import { billValidator } from "../validations/bill";

export const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) throw new Error("Bill not found");
    return res.status(200).json({ data: bill });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
export const getBillByIdUser = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { page = 1, limit = 10 } = req.query;
    const totalBills = await Bill.countDocuments({ user: userId });
    const Bills = await Bill.find({ user: userId })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json({
      Bills,
      pagination: {
        totalBills,
        totalPages: Math.ceil(totalBills / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getAllBill = async (req, res) => {
  try {
    const bills = await Bill.find();
    if (!bills) throw new Error("ALL bill not found");
    return res.status(200).json({ data: bills });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
export const createBill = async (req, res) => {
  try {
    const { error } = billValidator.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((message) => ({ message }));
      return res.status(400).json({ errors });
    }
    const bill = await Bill.create(req.body);
    return res.status(200).json(bill);
  } catch (error) {
    return res.status(400).json({
      message: "Thêm bill không thành công",
      error: error.message,
    });
  }
};

export const deleteBill = async (req, res) => {
  try {
    const id = req.params.id;
    const { error } = billValidator.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((message) => ({ message }));
      return res.status(400).json({ errors });
    }
    const bill = Bill.findById(id);
    if (!bill) {
      return res.status(404).json({
        message: "Không tìm thấy bill",
      });
    }
    await bill.delete();
    return res.status(200).json({
      message: "Xóa bill thành công",
      data: bill,
    });
  } catch (error) {
    res.status(400).json({
      message: "Xóa bill thất bại",
      error: error.message,
    });
  }
};

export const updateBill = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id: billId } = req.params;
    const updatedBilltData = req.body;

    // Kiểm tra hợp lệ dữ liệu đầu vào
    const { error } = billValidator.validate(updatedBilltData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updateBill = await Bill.findByIdAndUpdate(
      { _id: billId, user: userId },
      updatedBilltData,
      { new: true }
    );

    if (!updateBill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res.json({ message: "Update bill complete", updateBill });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
