"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Define the Support Schema
const SupportSchema = new mongoose_1.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    subject: {
        type: String,
    },
    description: {
        type: String,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
    },
    status: {
        type: Number,
        enum: [0, 1, 2],
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    modifiedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
// Define the Support model
const SupportModel = (0, mongoose_1.model)("supports", SupportSchema);
exports.default = SupportModel;
