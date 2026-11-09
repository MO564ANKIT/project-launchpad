ALTER TABLE public.shop_orders ADD COLUMN refund_reversed_at timestamptz;
CREATE OR REPLACE FUNCTION public.reverse_paypal_order(_capture_id text) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o public.shop_orders%ROWTYPE;
BEGIN
 SELECT * INTO o FROM public.shop_orders WHERE paypal_capture_id = _capture_id FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('reversed', false, 'reason', 'unknown-order'); END IF;
 IF o.refund_reversed_at IS NOT NULL OR o.status NOT IN ('completed', 'refunded') THEN RETURN jsonb_build_object('reversed', false); END IF;
 IF o.kind = 'shop' THEN
  DELETE FROM public.user_inventory WHERE order_id = o.paypal_order_id AND user_id = o.user_id AND source = 'purchase';
 ELSIF o.kind = 'goal_contribution' THEN
  UPDATE public.savings_goals SET contributed_cents = greatest(0, contributed_cents - o.amount_cents), completed_at = CASE WHEN greatest(0, contributed_cents - o.amount_cents) < target_cents THEN NULL ELSE completed_at END WHERE id = o.goal_id AND user_id = o.user_id;
 END IF;
 UPDATE public.shop_orders SET status = 'refunded', refund_reversed_at = now(), updated_at = now(), failure_reason = 'Refunded at PayPal; contribution or purchased items reversed. Milestone rewards retained.' WHERE paypal_order_id = o.paypal_order_id;
 RETURN jsonb_build_object('reversed', true);
END;
$$;
REVOKE ALL ON FUNCTION public.reverse_paypal_order(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reverse_paypal_order(text) TO service_role;