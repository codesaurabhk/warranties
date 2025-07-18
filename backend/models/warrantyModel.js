const mongoose = require("mongoose");

const WarrantySchema = new mongoose.Schema({
    warranty: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    period: {
        type: String,
        enum: ["Day", "Week", "Month", "Year"],
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
    toDate: {
        type: Date,
        required: true,
    },
    fromDate: {
        type: Date,
        required: true,
    }

},
    {
        timestamps: true
    });

module.exports = mongoose.model("Warranty", WarrantySchema);