import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  messages: defineTable({
    author: v.string(),
    body: v.string(),
  }),

  assets: defineTable({
    path: v.string(),
    storageId: v.id("_storage"),
    contentType: v.string(),
  }).index("by_path", ["path"]),
});
