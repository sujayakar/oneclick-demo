import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import {internal} from "./_generated/api"

const http = httpRouter();

http.route({
    pathPrefix: "/",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const url = new URL(request.url);        
        let path = url.pathname.startsWith("/") ? url.pathname.slice(1) : url.pathname;
        if (path == "" || path == "/") {
            path = "index.html";
        }        
        console.log(path);
        const asset = await ctx.runQuery(internal.assets.getAsset, { path });
        if (!asset) {
            return new Response("Not found", { status: 404 });
        }
        const contents = await ctx.storage.get(asset.storageId);
        return new Response(contents, {
            headers: {
                "Content-Type": asset.contentType,
            },
        });            
    }),
})

export default http;
