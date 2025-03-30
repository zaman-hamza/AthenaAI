import { httpRouter } from "convex/server";

import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/clerk-webhook-auth",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text();
    const headerPayload = request.headers;

    try {
      const result = await ctx.runAction(internal.clerk.fulfill, {
        payload: payloadString,
        headers: {
          "svix-id": headerPayload.get("svix-id")!,
          "svix-timestamp": headerPayload.get("svix-timestamp")!,
          "svix-signature": headerPayload.get("svix-signature")!,
        },
      });

      switch (result.type) {
        case "user.created":
          const emailId = result.data.primary_email_address_id as string;
          const email = result.data.email_addresses.find(
            (e) => e.id === emailId
          );

          const userProperties = {
            id: result.data.id,
            username: result.data.username ?? email?.email_address,
            first_name: result.data.first_name,
            last_name: result.data.last_name,
            image_url: result.data.image_url,
            has_image: result.data.has_image,
            banned: result.data.banned,
            created_at: result.data.created_at,
            last_sign_in_at: result.data.last_sign_in_at,
          };

          if (email && email.linked_to.length > 0) {
            const linkedType = email.linked_to[0].type;

            if (
              linkedType === "oauth_github" ||
              linkedType === "oauth_google"
            ) {
              await ctx.runMutation(internal.users.createUser, {
                user: userProperties,
              });
            } else if (linkedType === "oauth_discord") {
              await ctx.runMutation(internal.users.createUser, {
                user: {
                  ...userProperties,
                  last_sign_in_at: result.data.updated_at,
                },
              });
            }
          }
          break;
      }

      return new Response("Webhook Success", {
        status: 200,
      });
    } catch (err) {
      console.error(err);
      return new Response("Webhook Error", {
        status: 400,
      });
    }
  }),
});

http.route({
  path: "/getImage",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    // This storageId param should be an Id<"_storage">
    const storageId = searchParams.get("storageId")!;
    const blob = await ctx.storage.get(storageId);
    if (blob === null) {
      return new Response("Image not found", {
        status: 404,
      });
    }
    return new Response(blob);
  }),
});

export default http;
