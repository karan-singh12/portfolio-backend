"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ModelProfileTypeSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['hairType', 'bodyColor', 'eyeColor', 'ethinity']
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Admin",
    },
    status: {
        type: Number,
        enum: [0, 1, 2],
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    modifiedAt: {
        type: Date,
        default: Date.now
    },
});
const ModelProfileType = (0, mongoose_1.model)('modelProfileTypes', ModelProfileTypeSchema);
exports.default = ModelProfileType;
