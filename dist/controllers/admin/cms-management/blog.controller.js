"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelatedBlogs = exports.getFeaturedBlogs = exports.deleteBlogs = exports.likeBlog = exports.changeBlogStatus = exports.updateBlog = exports.getBlogBySlug = exports.getOneBlog = exports.getAllBlogs = exports.addBlog = void 0;
const bolg_model_1 = __importDefault(require("../../../models/bolg.model"));
const apiResponse_1 = require("../../../utils/apiResponse");
const functions_1 = require("../../../utils/functions");
const responseMssg_1 = require("../../../utils/responseMssg");
/* -------------------------------------------------------------------------- */
/*                          ✅ ADD BLOG POST                                  */
/* -------------------------------------------------------------------------- */
const addBlog = async (req, res, next) => {
    try {
        const { title, slug, excerpt, content, featuredImage, categories, tags, status, metaTitle, metaDescription, publishedAt } = req.body;
        if (!title)
            return next(new Error("Blog title is required."));
        if (!slug)
            return next(new Error("Blog slug is required."));
        if (!content)
            return next(new Error("Blog content is required."));
        if (!req.user || !req.user._id)
            return next(new Error("Unauthorized. User info not found."));
        // Check for duplicate slug
        const existing = await bolg_model_1.default.findOne({ slug });
        if (existing)
            return next(new Error("Blog with this slug already exists."));
        const newBlog = new bolg_model_1.default({
            title,
            slug: slug.toLowerCase().trim(),
            excerpt,
            content,
            author: {
                name: req.user.name || "Anonymous",
                email: req.user.email,
                avatar: req.user.avatar
            },
            featuredImage,
            categories: categories || [],
            tags: tags || [],
            status: status || 0,
            metaTitle,
            metaDescription,
            publishedAt: status === 1 ? (publishedAt || new Date()) : undefined
        });
        const savedBlog = await newBlog.save();
        (0, apiResponse_1.successResponseWithData)(res, "Blog post created successfully", savedBlog);
    }
    catch (err) {
        console.error("addBlog error:", err);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.addBlog = addBlog;
/* -------------------------------------------------------------------------- */
/*                          ✅ GET ALL BLOG POSTS                             */
/* -------------------------------------------------------------------------- */
const getAllBlogs = async (req, res, next) => {
    try {
        const { pageNumber = 1, pageSize = 10, searchItem, status, category, tag, author } = req.body;
        const searchQuery = {};
        // Filter by status
        if (status !== undefined)
            searchQuery.status = status;
        // Filter by category
        if (category)
            searchQuery.categories = { $in: [category] };
        // Filter by tag
        if (tag)
            searchQuery.tags = { $in: [tag] };
        // Filter by author name
        if (author)
            searchQuery["author.name"] = new RegExp(author.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        // Search in title, excerpt, or content
        if (searchItem) {
            const regex = new RegExp(searchItem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            searchQuery.$or = [
                { title: regex },
                { excerpt: regex },
                { content: regex }
            ];
        }
        const sort = { createdAt: -1 };
        const result = await (0, functions_1.listing)(bolg_model_1.default, [], searchQuery, {
            _id: 1,
            title: 1,
            slug: 1,
            excerpt: 1,
            author: 1,
            featuredImage: 1,
            categories: 1,
            tags: 1,
            status: 1,
            viewCount: 1,
            likeCount: 1,
            publishedAt: 1,
            createdAt: 1
        }, sort, pageNumber - 1, pageSize);
        const totalRecords = await bolg_model_1.default.countDocuments(searchQuery);
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, {
            result,
            totalRecords,
            pageNumber,
            pageSize
        });
    }
    catch (err) {
        console.error("getAllBlogs error:", err);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.getAllBlogs = getAllBlogs;
/* -------------------------------------------------------------------------- */
/*                          ✅ GET ONE BLOG POST                              */
/* -------------------------------------------------------------------------- */
const getOneBlog = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id)
            return next(new Error("Blog ID is required."));
        const blog = await bolg_model_1.default.findById(id);
        if (!blog)
            return next(new Error("Blog post not found."));
        // Increment view count
        blog.viewCount += 1;
        await blog.save();
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, blog);
    }
    catch (err) {
        console.error("getOneBlog error:", err);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.getOneBlog = getOneBlog;
/* -------------------------------------------------------------------------- */
/*                          ✅ GET BLOG BY SLUG                               */
/* -------------------------------------------------------------------------- */
const getBlogBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        if (!slug)
            return next(new Error("Blog slug is required."));
        const blog = await bolg_model_1.default.findOne({ slug });
        if (!blog)
            return next(new Error("Blog post not found."));
        // Increment view count
        blog.viewCount += 1;
        await blog.save();
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, blog);
    }
    catch (err) {
        console.error("getBlogBySlug error:", err);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.getBlogBySlug = getBlogBySlug;
/* -------------------------------------------------------------------------- */
/*                          ✅ UPDATE BLOG POST                               */
/* -------------------------------------------------------------------------- */
const updateBlog = async (req, res, next) => {
    try {
        const { id, title, slug, excerpt, content, author, featuredImage, categories, tags, status, metaTitle, metaDescription, publishedAt } = req.body;
        if (!id)
            return next(new Error("Blog ID is required."));
        const updateData = {};
        if (title)
            updateData.title = title;
        if (slug) {
            // Check if new slug already exists (excluding current blog)
            const existing = await bolg_model_1.default.findOne({ slug, _id: { $ne: id } });
            if (existing)
                return next(new Error("Blog with this slug already exists."));
            updateData.slug = slug.toLowerCase().trim();
        }
        if (excerpt !== undefined)
            updateData.excerpt = excerpt;
        if (content)
            updateData.content = content;
        if (author)
            updateData.author = author;
        if (featuredImage !== undefined)
            updateData.featuredImage = featuredImage;
        if (categories)
            updateData.categories = categories;
        if (tags)
            updateData.tags = tags;
        if (status !== undefined) {
            updateData.status = status;
            // Set publishedAt if publishing for the first time
            if (status === 1 && !publishedAt) {
                const currentBlog = await bolg_model_1.default.findById(id);
                if (currentBlog && !currentBlog.publishedAt) {
                    updateData.publishedAt = new Date();
                }
            }
        }
        if (metaTitle !== undefined)
            updateData.metaTitle = metaTitle;
        if (metaDescription !== undefined)
            updateData.metaDescription = metaDescription;
        if (publishedAt)
            updateData.publishedAt = publishedAt;
        updateData.modifiedAt = new Date();
        const updatedBlog = await bolg_model_1.default.findByIdAndUpdate(id, { $set: updateData }, { new: true, lean: true });
        if (!updatedBlog)
            return next(new Error("Blog post not found."));
        (0, apiResponse_1.successResponseWithData)(res, "Blog post updated successfully.", updatedBlog);
    }
    catch (err) {
        console.error("updateBlog error:", err);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.updateBlog = updateBlog;
/* -------------------------------------------------------------------------- */
/*                          ✅ CHANGE BLOG STATUS                             */
/* -------------------------------------------------------------------------- */
const changeBlogStatus = async (req, res, next) => {
    try {
        const { id, status } = req.body;
        if (!id)
            return next(new Error("Blog ID is required."));
        if (status === undefined)
            return next(new Error("Status is required."));
        const updateData = { status, modifiedAt: new Date() };
        // Set publishedAt when publishing
        if (status === 1) {
            const blog = await bolg_model_1.default.findById(id);
            if (blog && !blog.publishedAt) {
                updateData.publishedAt = new Date();
            }
        }
        const result = await bolg_model_1.default.findOneAndUpdate({ _id: id }, { $set: updateData }, { new: true });
        if (!result)
            return next(new Error("Blog post not found."));
        const msg = status === 1
            ? "Blog post published successfully."
            : status === 2
                ? "Blog post archived successfully."
                : "Blog post saved as draft.";
        (0, apiResponse_1.successResponseWithData)(res, msg, result);
    }
    catch (error) {
        console.error("changeBlogStatus error:", error);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.changeBlogStatus = changeBlogStatus;
/* -------------------------------------------------------------------------- */
/*                          ✅ INCREMENT LIKE COUNT                           */
/* -------------------------------------------------------------------------- */
const likeBlog = async (req, res, next) => {
    try {
        const { id } = req.body;
        if (!id)
            return next(new Error("Blog ID is required."));
        const blog = await bolg_model_1.default.findByIdAndUpdate(id, { $inc: { likeCount: 1 } }, { new: true });
        if (!blog)
            return next(new Error("Blog post not found."));
        (0, apiResponse_1.successResponseWithData)(res, "Blog liked successfully.", {
            likeCount: blog.likeCount
        });
    }
    catch (error) {
        console.error("likeBlog error:", error);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.likeBlog = likeBlog;
/* -------------------------------------------------------------------------- */
/*                          ✅ DELETE BLOG POSTS                              */
/* -------------------------------------------------------------------------- */
const deleteBlogs = async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0)
            return next(new Error("At least one Blog ID is required."));
        const result = await bolg_model_1.default.deleteMany({ _id: { $in: ids } });
        if (result.deletedCount === 0)
            return next(new Error("No matching blog posts found."));
        (0, apiResponse_1.successResponseWithData)(res, "Blog posts deleted successfully.", {
            deletedCount: result.deletedCount
        });
    }
    catch (err) {
        console.error("deleteBlogs error:", err);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.deleteBlogs = deleteBlogs;
/* -------------------------------------------------------------------------- */
/*                          ✅ GET FEATURED BLOGS                             */
/* -------------------------------------------------------------------------- */
const getFeaturedBlogs = async (req, res, next) => {
    try {
        const { limit = 5 } = req.body;
        const featuredBlogs = await bolg_model_1.default.find({ status: 1 })
            .sort({ viewCount: -1, likeCount: -1 })
            .limit(limit)
            .select("title slug excerpt featuredImage author viewCount likeCount publishedAt");
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, featuredBlogs);
    }
    catch (err) {
        console.error("getFeaturedBlogs error:", err);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.getFeaturedBlogs = getFeaturedBlogs;
/* -------------------------------------------------------------------------- */
/*                          ✅ GET RELATED BLOGS                              */
/* -------------------------------------------------------------------------- */
const getRelatedBlogs = async (req, res, next) => {
    try {
        const { id, limit = 4 } = req.body;
        if (!id)
            return next(new Error("Blog ID is required."));
        const currentBlog = await bolg_model_1.default.findById(id);
        if (!currentBlog)
            return next(new Error("Blog post not found."));
        const relatedBlogs = await bolg_model_1.default.find({
            _id: { $ne: id },
            status: 1,
            $or: [
                { categories: { $in: currentBlog.categories } },
                { tags: { $in: currentBlog.tags } }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("title slug excerpt featuredImage author publishedAt");
        (0, apiResponse_1.successResponseWithData)(res, responseMssg_1.SUCCESS.dataFound, relatedBlogs);
    }
    catch (err) {
        console.error("getRelatedBlogs error:", err);
        next(new Error(responseMssg_1.ERROR.SomethingWrong));
    }
};
exports.getRelatedBlogs = getRelatedBlogs;
