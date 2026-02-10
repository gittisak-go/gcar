-- 002_calculate_reservation_total.sql

CREATE OR REPLACE FUNCTION public.calculate_reservation_total()
RETURNS TRIGGER AS $$
DECLARE
  v_price NUMERIC;
  v_days NUMERIC;
BEGIN
  -- 1. Get vehicle price
  SELECT price_per_day INTO v_price
  FROM public.vehicles
  WHERE id = NEW.vehicle_id;

  -- 2. Calculate duration (minimum 1 day)
  -- Extract days from interval
  v_days := EXTRACT(EPOCH FROM (NEW.dropoff_date - NEW.pickup_date)) / 86400;
  
  IF v_days < 1 THEN
    v_days := 1;
  ELSE
    v_days := CEIL(v_days);
  END IF;

  -- 3. Set Total Price
  NEW.total_price := v_price * v_days;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_reservation_total
  BEFORE INSERT ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_reservation_total();
