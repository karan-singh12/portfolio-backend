"use strict";
// import mongoose, { Schema, Document, Model } from "mongoose";
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
exports.PlanType = void 0;
// interface IMembership extends Document {
//   userId: mongoose.Types.ObjectId;
//   type: "trial" | "regular" | "premium" | "frozen";
//   startDate: Date;
//   endDate: Date;
//   creditsDiscount?: number;
//   createdAt?: Date;
//   modifiedAt?: Date;
// }
// const MembershipSchema: Schema<IMembership> = new Schema(
//   {
//     userId: {
//       type: Schema.Types.ObjectId,
//       ref: "users",
//     },
//     type: {
//       type: String,
//       enum: ["trial", "regular", "premium", "frozen"],
//       default: "trial",
//     },
//     startDate: {
//       type: Date,
//       default: Date.now,
//     },
//     endDate: {
//       type: Date,
//     },
//     creditsDiscount: {
//       type: Number,
//       default: 0,
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now,
//     },
//     modifiedAt: {
//       type: Date,
//       default: Date.now,
//     },
//   },
//   {
//     timestamps: { createdAt: "createdAt", updatedAt: "modifiedAt" },
//   }
// );
// const MembershipModel: Model<IMembership> = mongoose.model<IMembership>("memberships", MembershipSchema);
// export default MembershipModel;
// src/models/Package.ts
const mongoose_1 = __importStar(require("mongoose"));
var PlanType;
(function (PlanType) {
    PlanType["STANDARD"] = "standard";
    PlanType["PREMIUM"] = "premium";
    PlanType["VIP"] = "vip";
    PlanType["NATIONAL"] = "national";
})(PlanType || (exports.PlanType = PlanType = {}));
const PackageSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    planType: {
        type: String,
        enum: Object.values(PlanType),
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    duration: {
        type: Number,
        required: true
    },
    features: [String],
    isActive: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    isRetired: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
PackageSchema.index({ isActive: 1, displayOrder: 1 });
exports.default = mongoose_1.default.model('Package', PackageSchema);
