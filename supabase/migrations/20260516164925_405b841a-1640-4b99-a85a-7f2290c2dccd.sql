
CREATE OR REPLACE FUNCTION public.create_order_with_items(
  _customer_name text,
  _phone text,
  _governorate text,
  _address text,
  _notes text,
  _subtotal numeric,
  _shipping_cost numeric,
  _discount numeric,
  _total numeric,
  _coupon_code text,
  _items jsonb
)
RETURNS TABLE(order_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_order_id uuid;
  new_order_number text;
BEGIN
  INSERT INTO public.orders (customer_name, phone, governorate, address, notes,
    subtotal, shipping_cost, discount, total, coupon_code)
  VALUES (_customer_name, _phone, _governorate, _address, _notes,
    _subtotal, _shipping_cost, _discount, _total, _coupon_code)
  RETURNING id, orders.order_number INTO new_order_id, new_order_number;

  INSERT INTO public.order_items (order_id, product_id, product_name, product_image, size, color, qty, unit_price)
  SELECT new_order_id,
    (item->>'product_id')::uuid,
    item->>'product_name',
    item->>'product_image',
    item->>'size',
    item->>'color',
    (item->>'qty')::int,
    (item->>'unit_price')::numeric
  FROM jsonb_array_elements(_items) AS item;

  RETURN QUERY SELECT new_order_number;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order_with_items(text,text,text,text,text,numeric,numeric,numeric,numeric,text,jsonb) TO anon, authenticated;
