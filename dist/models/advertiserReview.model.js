"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Define the AdvertiserReview Schema
const AdvertiserReviewSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
    },
    userName: {
        type: String
    },
    userAvatar: {
        type: String
    },
    advertiserId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
    },
    advertiserName: {
        type: String
    },
    rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
    },
    title: {
        type: String
    },
    comment: {
        type: String
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    reportCount: {
        type: Number,
        default: 0
    },
    status: {
        type: Number,
        enum: [0, 1, 2],
        default: 0
    },
    moderatorNote: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    modifiedAt: {
        type: Date,
        default: Date.now
    }
});
// Compound indexes for efficient queries
AdvertiserReviewSchema.index({ advertiserId: 1, status: 1, createdAt: -1 });
AdvertiserReviewSchema.index({ userId: 1, advertiserId: 1 }, { unique: true });
AdvertiserReviewSchema.index({ rating: 1 });
const AdvertiserReviewModel = mongoose_1.default.model("AdvertiserReview", AdvertiserReviewSchema);
exports.default = AdvertiserReviewModel;
