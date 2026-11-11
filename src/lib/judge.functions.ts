import { createServerFn } from "@tanstack/react-start";

// Deliberately public judge entry: creates only a new isolated test identity,
// never accepts an existing user id, email, password or privilege from the caller.
export const enterJudgeMode = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { createDemoState } = await import("./sampleData");
  const id = crypto.randomUUID();
  const email = `judge-${id}@spendemon.example`;
  const password = `${crypto.randomUUID()}${crypto.randomUUID()}`;
  const created = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { judge_mode: true },
  });
  if (created.error || !created.data.user)
    throw new Error("Judge mode could not start. Please try again.");
  const userId = created.data.user.id;
  try {
    const { error: saveError } = await supabaseAdmin.from("player_saves").insert({
      user_id: userId,
      state: JSON.parse(JSON.stringify(createDemoState(new Date()))),
      version: 1,
    });
    if (saveError) throw saveError;
    const { error: demoError } = await supabaseAdmin.rpc("start_demo_journey", {
      _user_id: userId,
    });
    if (demoError) throw demoError;
    // Sign in on a throwaway client: signing in on the shared admin client would
    // replace its service-role identity with the judge's for later requests.
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("Backend settings missing.");
    const authClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    });
    const signed = await authClient.auth.signInWithPassword({ email, password });
    if (signed.error || !signed.data.session) throw new Error("Could not sign in to judge mode.");
    return {
      access_token: signed.data.session.access_token,
      refresh_token: signed.data.session.refresh_token,
    };
  } catch (error) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    console.error("Judge entry failed", error instanceof Error ? error.message : "unknown");
    throw new Error("Judge mode could not start. Please try again.");
  }
});
