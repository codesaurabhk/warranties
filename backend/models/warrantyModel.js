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
        enum: ["Day", "Month", "Year"],
        required: true
    },
    Status: {
        type: Boolean,
        default: false
    },

},
    {
        timestamps: true
    });

module.exports = mongoose.model("Warranty", WarrantySchema);