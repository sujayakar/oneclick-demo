import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const startUpload = internalMutation({
    args: {    
    },
    handler: async (ctx, args) => {
        return await ctx.storage.generateUploadUrl();
    }
})

export const uploadAsset = internalMutation({
    args: {
        path: v.string(),
        contentType: v.string(),
        id: v.id("_storage"),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.query("assets").withIndex("by_path", (q) => q.eq("path", args.path)).first();
        if (existing) {
            await ctx.db.delete(existing._id);
        }
        await ctx.db.insert("assets", {
            path: args.path,
            storageId: args.id,
            contentType: args.contentType,
        });
    }
})

export const getAsset = internalQuery({
    args: {
        path: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.query("assets").withIndex("by_path", (q) => q.eq("path", args.path)).first();
    }
})