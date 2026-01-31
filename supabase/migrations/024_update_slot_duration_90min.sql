-- Обновляем длительность слотов с 1 часа до 1.5 часа (90 минут)
-- для всех функций генерации слотов

-- Обновляем основную функцию генерации слотов
CREATE OR REPLACE FUNCTION generate_time_slots_for_period(p_period_id uuid)
RETURNS void AS $$
DECLARE
    v_period RECORD;
    v_current_date date;
    v_current_time time;
    v_slot_duration interval := '1 hour 30 minutes'; -- Изменено с 1 часа на 1.5 часа
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
        -- Для каждой даты создаем слоты с интервалом 1.5 часа
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

-- Комментарий: После применения этой миграции все НОВЫЕ периоды будут создавать слоты по 1.5 часа.
-- Для обновления существующих слотов нужно вручную вызвать:
-- SELECT generate_time_slots_for_period(id) FROM schedule_periods;
-- ВНИМАНИЕ: Это удалит все существующие слоты и создаст новые!
