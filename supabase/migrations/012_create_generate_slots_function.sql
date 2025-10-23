-- Create function to generate time slots for a schedule period
-- Генерирует слоты с интервалом 1 час
CREATE OR REPLACE FUNCTION generate_time_slots_for_period(p_period_id uuid)
RETURNS void AS $$
DECLARE
    v_period RECORD;
    v_current_date date;
    v_current_time time;
    v_slot_duration interval := '1 hour';
BEGIN
    -- Получаем данные периода
    SELECT * INTO v_period
    FROM public.schedule_periods
    WHERE id = p_period_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Schedule period with id % not found', p_period_id;
    END IF;
    
    -- Удаляем существующие слоты для этого периода (если есть)
    DELETE FROM public.time_slots WHERE period_id = p_period_id;
    
    -- Итерируемся по каждой дате в периоде
    v_current_date := v_period.start_date;
    
    WHILE v_current_date <= v_period.end_date LOOP
        -- Для каждой даты создаем слоты с интервалом 1 час
        v_current_time := v_period.work_start_time;
        
        WHILE v_current_time + v_slot_duration <= v_period.work_end_time LOOP
            -- Создаем слот
            INSERT INTO public.time_slots (
                period_id,
                slot_date,
                start_time,
                end_time,
                is_booked
            ) VALUES (
                p_period_id,
                v_current_date,
                v_current_time,
                v_current_time + v_slot_duration,
                false
            );
            
            -- Переходим к следующему слоту
            v_current_time := v_current_time + v_slot_duration;
        END LOOP;
        
        -- Переходим к следующей дате
        v_current_date := v_current_date + interval '1 day';
    END LOOP;
    
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate slots when a new period is created
CREATE OR REPLACE FUNCTION trigger_generate_slots_on_period_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Генерируем слоты для нового периода
    PERFORM generate_time_slots_for_period(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_generate_slots_on_period_insert
AFTER INSERT ON public.schedule_periods
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_slots_on_period_insert();

-- Create trigger to regenerate slots when period is updated
CREATE OR REPLACE FUNCTION trigger_regenerate_slots_on_period_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Проверяем, изменились ли важные поля (даты или время работы)
    IF (OLD.start_date != NEW.start_date OR 
        OLD.end_date != NEW.end_date OR 
        OLD.work_start_time != NEW.work_start_time OR 
        OLD.work_end_time != NEW.work_end_time) THEN
        
        -- Регенерируем слоты
        PERFORM generate_time_slots_for_period(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_regenerate_slots_on_period_update
AFTER UPDATE ON public.schedule_periods
FOR EACH ROW
EXECUTE FUNCTION trigger_regenerate_slots_on_period_update();

-- Создаем вспомогательную функцию для получения доступных слотов по городу и дате
CREATE OR REPLACE FUNCTION get_available_slots_by_city_and_date(
    p_city_id uuid,
    p_date date
)
RETURNS TABLE (
    slot_id uuid,
    slot_date date,
    start_time time,
    end_time time,
    is_booked boolean,
    period_id uuid
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.id as slot_id,
        ts.slot_date,
        ts.start_time,
        ts.end_time,
        ts.is_booked,
        ts.period_id
    FROM public.time_slots ts
    INNER JOIN public.schedule_periods sp ON ts.period_id = sp.id
    WHERE sp.city_id = p_city_id
        AND ts.slot_date = p_date
        AND ts.slot_date >= CURRENT_DATE  -- Только будущие даты
    ORDER BY ts.start_time;
END;
$$ LANGUAGE plpgsql;
