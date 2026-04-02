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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkUpload = exports.deleteProduct = exports.editProduct = exports.getOneProduct = exports.getProducts = exports.addProduct = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const product_model_1 = __importDefault(require("../../../models/product.model"));
const productRating_model_1 = __importDefault(require("../../../models/productRating.model"));
const apiResponse = __importStar(require("../../../utils/apiResponse"));
const responseMssg_1 = require("../../../utils/responseMssg");
const mongoose_1 = __importDefault(require("mongoose"));
const generateSKU = async (type) => {
    const prefix = type.charAt(0).toUpperCase();
    const count = await product_model_1.default.countDocuments();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${(count + 1).toString().padStart(4, '0')}-${randomSuffix}`;
};
exports.addProduct = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { wineName, vintage, type, region, subRegion, sku, price, cost, acquisitionDate, tastingNotes, criticRatings, relatedWines, quantity, adminDescription, conditionStorage, marketPrice, specialPrice, specialPriceExpiration, caseSize, preArrival, newOffering, deepDiscount, productLocation, ...rest } = req.body;
    if (!wineName || !vintage || !type || !region || !subRegion || !price || !cost || !acquisitionDate) {
        apiResponse.validationErrorResponse(res, responseMssg_1.PRODUCT.invalidData, [
            "Missing required fields: wineName, vintage, type, region, subRegion, price, cost, acquisitionDate"
        ]);
        return;
    }
    let finalSku = sku;
    if (sku === "#" || !sku) {
        finalSku = await generateSKU(type);
    }
    let finalQuantity = Number(quantity || 0);
    if (finalQuantity < 0)
        finalQuantity = 0;
    const acqDate = new Date(acquisitionDate);
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const autoNewArrival = acqDate >= fourWeeksAgo;
    const files = req.files;
    const images = files ? files.map(file => file.path) : [];
    const safeParse = (data) => {
        if (!data)
            return undefined;
        if (typeof data === 'object')
            return data;
        try {
            return JSON.parse(data);
        }
        catch (e) {
            return undefined;
        }
    };
    const newProduct = new product_model_1.default({
        wineName,
        vintage,
        type,
        region,
        subRegion,
        sku: finalSku,
        price: Number(price),
        cost: Number(cost),
        acquisitionDate: acqDate,
        quantity: finalQuantity,
        tastingNotes: safeParse(tastingNotes) || {},
        images,
        relatedWines: safeParse(relatedWines) || [],
        adminDescription,
        conditionStorage,
        marketPrice: marketPrice ? Number(marketPrice) : undefined,
        specialPrice: specialPrice ? Number(specialPrice) : undefined,
        specialPriceExpiration: specialPriceExpiration ? new Date(specialPriceExpiration) : undefined,
        caseSize: Number(caseSize || 1),
        preArrival: preArrival === 'true' || preArrival === true,
        newArrival: autoNewArrival,
        newOffering: newOffering === 'true' || newOffering === true,
        deepDiscount: deepDiscount === 'true' || deepDiscount === true,
        productLocation,
        availabilityStatus: finalQuantity > 0 ? "In-stock" : "Out-of-stock",
        ...rest
    });
    const currentRelated = safeParse(relatedWines) || [];
    if (currentRelated.length === 0) {
        const recommendations = await product_model_1.default.find({
            type: type,
            region: region,
            _id: { $ne: newProduct._id }
        }).limit(5).select('_id');
        newProduct.relatedWines = recommendations.map(r => r._id);
    }
    const savedProduct = await newProduct.save();
    const ratings = safeParse(criticRatings);
    if (Array.isArray(ratings)) {
        const ratingDocs = ratings.map((r) => ({
            productId: savedProduct._id,
            criticName: r.criticName,
            score: r.score,
            excerpt: r.excerpt
        }));
        await productRating_model_1.default.insertMany(ratingDocs);
    }
    apiResponse.createdResponse(res, responseMssg_1.PRODUCT.productAdded, savedProduct);
});
exports.getProducts = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { page = 1, limit = 10, search, type, region, minPrice, maxPrice, availabilityStatus, newArrival, newOffering, vintage } = req.body;
    const query = {};
    if (search) {
        query.wineName = { $regex: search, $options: "i" };
    }
    if (type)
        query.type = type;
    if (region)
        query.region = region;
    if (vintage)
        query.vintage = vintage;
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice)
            query.price.$gte = Number(minPrice);
        if (maxPrice)
            query.price.$lte = Number(maxPrice);
    }
    if (availabilityStatus) {
        if (availabilityStatus === "Low-stock") {
            query.quantity = { $gt: 0, $lte: 5 };
        }
        else {
            query.availabilityStatus = availabilityStatus;
        }
    }
    if (newArrival === true || newArrival === 'true') {
        query.newArrival = true;
    }
    if (newOffering === true || newOffering === 'true') {
        query.newOffering = true;
    }
    const products = await product_model_1.default.find(query)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));
    const total = await product_model_1.default.countDocuments(query);
    apiResponse.paginatedResponse(res, responseMssg_1.PRODUCT.productFound, products, Number(page), Number(limit), total);
});
exports.getOneProduct = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        apiResponse.validationErrorResponse(res, responseMssg_1.PRODUCT.invalidData, ["Invalid Product ID"]);
        return;
    }
    const product = await product_model_1.default.findById(id).populate("relatedWines");
    if (!product) {
        apiResponse.notFoundResponse(res, responseMssg_1.PRODUCT.productNotFound);
        return;
    }
    const ratings = await productRating_model_1.default.find({ productId: id });
    apiResponse.successResponse(res, responseMssg_1.PRODUCT.productFound, { product, ratings });
});
exports.editProduct = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.body; // Using body since it's a POST now
    const updateData = { ...req.body };
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        apiResponse.validationErrorResponse(res, responseMssg_1.PRODUCT.invalidData, ["Invalid Product ID"]);
        return;
    }
    const product = await product_model_1.default.findById(id);
    if (!product) {
        apiResponse.notFoundResponse(res, responseMssg_1.PRODUCT.productNotFound);
        return;
    }
    // Quantity Handling: -1 = no change, -2 = 0, >=0 = set value
    if (updateData.quantity !== undefined) {
        const q = Number(updateData.quantity);
        if (q === -1) {
            delete updateData.quantity; // Keep existing
        }
        else if (q === -2) {
            updateData.quantity = 0; // Out of stock
        }
        else if (q >= 0) {
            updateData.quantity = q;
        }
    }
    // Image Handling
    const files = req.files;
    if (files && files.length > 0) {
        const newImages = files.map(file => file.path);
        updateData.images = [...(product.images || []), ...newImages];
    }
    // Parsing Nested Fields
    const safeParse = (data) => {
        if (!data)
            return undefined;
        if (typeof data === 'object')
            return data;
        try {
            return JSON.parse(data);
        }
        catch (e) {
            return undefined;
        }
    };
    if (updateData.tastingNotes)
        updateData.tastingNotes = safeParse(updateData.tastingNotes);
    if (updateData.relatedWines)
        updateData.relatedWines = safeParse(updateData.relatedWines);
    // Update availabilityStatus based on quantity if changed
    if (updateData.quantity !== undefined) {
        updateData.availabilityStatus = updateData.quantity > 0 ? "In-stock" : "Out-of-stock";
    }
    // Handle Dates
    if (updateData.acquisitionDate)
        updateData.acquisitionDate = new Date(updateData.acquisitionDate);
    if (updateData.specialPriceExpiration)
        updateData.specialPriceExpiration = new Date(updateData.specialPriceExpiration);
    // Re-evaluate New Arrival if acquisitionDate changed
    if (updateData.acquisitionDate) {
        const acqDate = new Date(updateData.acquisitionDate);
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        updateData.newArrival = acqDate >= fourWeeksAgo;
    }
    Object.assign(product, updateData);
    product.modifiedAt = new Date();
    const updatedProduct = await product.save();
    // Critic Ratings Updates
    if (updateData.criticRatings) {
        const ratings = safeParse(updateData.criticRatings);
        if (Array.isArray(ratings)) {
            await productRating_model_1.default.deleteMany({ productId: id });
            const ratingDocs = ratings.map((r) => ({
                productId: id,
                criticName: r.criticName,
                score: r.score,
                excerpt: r.excerpt
            }));
            await productRating_model_1.default.insertMany(ratingDocs);
        }
    }
    apiResponse.successResponse(res, responseMssg_1.PRODUCT.productUpdated, updatedProduct);
});
exports.deleteProduct = (0, express_async_handler_1.default)(async (req, res, next) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        apiResponse.validationErrorResponse(res, responseMssg_1.PRODUCT.invalidData, ["Invalid Product ID"]);
        return;
    }
    const result = await product_model_1.default.findByIdAndDelete(id);
    if (!result) {
        apiResponse.notFoundResponse(res, responseMssg_1.PRODUCT.productNotFound);
        return;
    }
    // Also delete associated ratings
    await productRating_model_1.default.deleteMany({ productId: id });
    apiResponse.successResponse(res, responseMssg_1.PRODUCT.productDeleted);
});
exports.bulkUpload = (0, express_async_handler_1.default)(async (req, res, next) => {
    const file = req.file;
    if (!file) {
        apiResponse.validationErrorResponse(res, responseMssg_1.PRODUCT.invalidData, ["No file uploaded"]);
        return;
    }
    const results = [];
    const fs = require('fs');
    const csv = require('csv-parser');
    fs.createReadStream(file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
        try {
            const productsToInsert = [];
            const errors = [];
            for (let [index, row] of results.entries()) {
                if (!row.wineName || !row.vintage || !row.region || !row.price) {
                    errors.push(`Row ${index + 1}: Missing required fields (wineName, vintage, region, price)`);
                    continue;
                }
                const productData = {
                    wineName: row.wineName,
                    vintage: row.vintage,
                    type: row.type || "Red",
                    region: row.region,
                    subRegion: row.subRegion || "N/A",
                    sku: row.sku || "#",
                    price: Number(row.price),
                    cost: Number(row.cost || 0),
                    acquisitionDate: row.acquisitionDate ? new Date(row.acquisitionDate) : new Date(),
                    quantity: Number(row.quantity || 0),
                    caseSize: Number(row.caseSize || 1),
                    preArrival: row.preArrival === 'true',
                    newOffering: row.newOffering === 'true',
                    deepDiscount: row.deepDiscount === 'true',
                    availabilityStatus: row.availabilityStatus || "In-stock",
                    adminDescription: row.adminDescription,
                    productLocation: row.productLocation
                };
                if (productData.sku === "#") {
                    productData.sku = await generateSKU(productData.type);
                }
                // Auto New Arrival
                const acqDate = productData.acquisitionDate;
                const fourWeeksAgo = new Date();
                fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
                productData.newArrival = acqDate >= fourWeeksAgo;
                productsToInsert.push(productData);
            }
            if (productsToInsert.length > 0) {
                await product_model_1.default.insertMany(productsToInsert);
            }
            if (errors.length > 0) {
                apiResponse.successResponse(res, "Bulk upload completed with some errors", {
                    count: productsToInsert.length,
                    errors: errors
                });
            }
            else {
                apiResponse.successResponse(res, responseMssg_1.PRODUCT.bulkUploadSuccess, { count: productsToInsert.length });
            }
        }
        catch (error) {
            apiResponse.internalServerErrorResponse(res, error.message);
        }
    });
});
