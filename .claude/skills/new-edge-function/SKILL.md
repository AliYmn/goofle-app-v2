---
description: When the user asks to create a new Supabase edge function
---

# New edge function skill

Create a complete Supabase Deno edge function following Gooflo's patterns.

## Steps

1. **Spec** -- Clarify with the user if not obvious:
   - Function name (kebab-case)
   - Purpose and trigger (client invocation, webhook, scheduled)
   - Request body shape
   - Response shape
   - Auth requirements (anon key, service role, webhook secret)
2. **Scaffold** -- Run `make edge-new name=<function-name>` to create the function directory
3. **Implement** -- Write the function in `supabase/functions/<name>/index.ts`:
   - Import from Supabase JS client
   - Validate request body
   - Implement business logic
   - Return proper JSON responses with status codes
   - Handle errors with meaningful messages
4. **Test locally** -- Suggest running `make edge-serve` and test with curl
5. **Deploy** -- Suggest `make edge-deploy-one name=<function-name>`
6. **Client integration** -- If invoked from the app, add the `supabase.functions.invoke()` call
7. **Verify** -- Show example request/response
8. **Log** -- Update tasks/changelog.md

## Edge function template

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const body = await req.json();

    // Implementation here

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
```

## Checklist

- CORS headers included
- Request body validated before processing
- Auth token verified if function requires authentication
- Service role key used only for admin operations
- Error responses include meaningful messages
- No secrets hardcoded -- use `Deno.env.get()`
- Function name added to Makefile if custom deploy target needed
