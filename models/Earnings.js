import mongoose from "mongoose";

const earningSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  earningsAmount: Number,
  transactionDate: Date,
});

const adminEarning = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  earningsAmount: Number,
  transactionDate: Date,
});

export const AdminEarning = mongoose.model("AdminEarning", adminEarning);
export const Earning = mongoose.model("Earning", earningSchema);
