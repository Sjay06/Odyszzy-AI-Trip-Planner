import mongoose from "mongoose";

const VisaQuerySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true, // Firebase UID
    },
    nationality: { type: String, required: true },
    destinationCountry: { type: String, required: true },
    visa: { type: mongoose.Schema.Types.Mixed, required: true }, // visaAgent result
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "visa_queries" }
);

const VisaQuery = mongoose.model("VisaQuery", VisaQuerySchema);
export default VisaQuery;
