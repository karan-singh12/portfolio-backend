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
const ProductSchema = new mongoose_1.Schema({
    wineName: { type: String, required: true },
    vintage: { type: String, required: true },
    type: {
        type: String,
        enum: ["Red", "White", "Sparkling", "Rosé", "Dessert"],
        required: true,
    },
    region: { type: String, required: true },
    subRegion: { type: String, required: true },
    adminDescription: { type: String },
    tastingNotes: {
        flavorProfile: { type: String },
        aroma: { type: String },
        pairingSuggestions: { type: String },
    },
    conditionStorage: { type: String },
    price: { type: Number, required: true },
    marketPrice: { type: Number },
    specialPrice: { type: Number },
    specialPriceExpiration: { type: Date },
    cost: { type: Number, required: true },
    acquisitionDate: { type: Date, required: true },
    quantity: { type: Number, default: 0 },
    caseSize: { type: Number, default: 1 },
    preArrival: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    newOffering: { type: Boolean, default: false },
    deepDiscount: { type: Boolean, default: false },
    productLocation: { type: String },
    sku: { type: String, required: true, unique: true },
    images: [{ type: String }],
    availabilityStatus: {
        type: String,
        enum: ["In-stock", "Out-of-stock"],
        default: "In-stock",
    },
    relatedWines: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "products" }],
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now },
}, { timestamps: true });
const ProductModel = mongoose_1.default.model("products", ProductSchema);
exports.default = ProductModel;
