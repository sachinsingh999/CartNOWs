import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "order", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    sellerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "seller" }],
    invoiceDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, required: true },
    transactionId: { type: String, default: "" },
    paymentStatus: { type: String, default: "Paid" },
    orderStatus: { type: String, required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingCharges: { type: Number, default: 0 },
    taxAmount: { type: Number, required: true },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    pdfUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

const invoiceModel = mongoose.models.invoice || mongoose.model("invoice", invoiceSchema);
export default invoiceModel;
