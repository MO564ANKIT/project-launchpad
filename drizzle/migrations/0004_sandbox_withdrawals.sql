ALTER TABLE public.shop_orders DROP CONSTRAINT shop_orders_kind_check;
ALTER TABLE public.shop_orders ADD CONSTRAINT shop_orders_kind_check CHECK (kind IN ('shop', 'goal_contribution', 'payout'));
ALTER TABLE public.savings_goals ADD COLUMN withdrawn_cents integer NOT NULL DEFAULT 0;
ALTER TABLE public.shop_orders ADD COLUMN payout_batch_id text;
CREATE UNIQUE INDEX one_payout_per_goal ON public.shop_orders(goal_id) WHERE kind = 'payout';
CREATE OR REPLACE FUNCTION public.reserve_goal_payout(_goal_id uuid, _user_id uuid, _simulate boolean) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE g public.savings_goals%ROWTYPE; o public.shop_orders%ROWTYPE; ref text;
BEGIN
 SELECT * INTO g FROM public.savings_goals WHERE id = _goal_id AND user_id = _user_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Goal not found'; END IF;
 SELECT * INTO o FROM public.shop_orders WHERE goal_id = _goal_id AND kind = 'payout';
 IF FOUND THEN RETURN to_jsonb(o); END IF;
 IF g.completed_at IS NULL OR g.contributed_cents < g.target_cents OR g.contributed_cents - g.withdrawn_cents <= 0 THEN RAISE EXCEPTION 'Only a fully funded completed goal can be withdrawn'; END IF;
 IF g.is_demo AND NOT _simulate THEN RAISE EXCEPTION 'Demo funds cannot be withdrawn through PayPal'; END IF;
 IF NOT _simulate AND EXISTS (SELECT 1 FROM public.shop_orders WHERE goal_id = g.id AND kind = 'goal_contribution' AND is_demo) THEN RAISE EXCEPTION 'Simulated contributions cannot fund a PayPal payout'; END IF;
 ref := 'payout-' || replace(g.id::text, '-', '');
 INSERT INTO public.shop_orders (paypal_order_id, user_id, kind, goal_id, item_ids, amount_cents, currency, status, is_demo) VALUES (ref, _user_id, 'payout', g.id, '{}', g.contributed_cents - g.withdrawn_cents, 'USD', 'created', _simulate OR g.is_demo) RETURNING * INTO o;
 RETURN to_jsonb(o);
END; $$;
REVOKE ALL ON FUNCTION public.reserve_goal_payout(uuid, uuid, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_goal_payout(uuid, uuid, boolean) TO service_role;
CREATE OR REPLACE FUNCTION public.settle_goal_payout(_order_id text, _batch_id text, _simulate boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.shop_orders%ROWTYPE;
BEGIN
 UPDATE public.shop_orders SET status = 'completed', payout_batch_id = _batch_id, is_demo = _simulate, updated_at = now(), captured_at = now(), failure_reason = CASE WHEN _simulate THEN 'Simulated payout; no money moved' ELSE 'PayPal payout confirmed' END WHERE paypal_order_id = _order_id AND kind = 'payout' AND status IN ('created','pending') RETURNING * INTO o;
 IF FOUND AND NOT _simulate THEN UPDATE public.savings_goals SET withdrawn_cents = withdrawn_cents + o.amount_cents WHERE id = o.goal_id AND user_id = o.user_id; END IF;
END; $$;
REVOKE ALL ON FUNCTION public.settle_goal_payout(text, text, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_goal_payout(text, text, boolean) TO service_role;