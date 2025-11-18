# SMS Verification Setup

Эта система использует SMS-подтверждение для верификации телефонов перед бронированием.

## Компоненты системы

1. **База данных**: Таблица `phone_verification_codes` для хранения кодов
2. **Edge Function**: `send-sms` для отправки SMS (Supabase Edge Function)
3. **Frontend**: Интеграция в `BookingWidget.jsx`

## Настройка SMS провайдера

### Вариант 1: SMS.ru

1. Зарегистрируйтесь на [sms.ru](https://sms.ru)
2. Получите API ключ
3. Раскомментируйте код в `supabase/functions/send-sms/index.ts`
4. Добавьте API ключ в Supabase:
   ```bash
   supabase secrets set SMS_RU_API_KEY=your_api_key_here
   ```

### Вариант 2: Twilio

1. Зарегистрируйтесь на [twilio.com](https://twilio.com)
2. Получите Account SID, Auth Token и Phone Number
3. Обновите код в Edge Function:
   ```typescript
   const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
   const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
   const fromPhone = Deno.env.get('TWILIO_PHONE_NUMBER')
   
   const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
     method: 'POST',
     headers: {
       'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
       'Content-Type': 'application/x-www-form-urlencoded',
     },
     body: new URLSearchParams({
       From: fromPhone,
       To: phone,
       Body: `Ваш код подтверждения: ${code}`
     })
   })
   ```

### Вариант 3: SMSC.ru

1. Зарегистрируйтесь на [smsc.ru](https://smsc.ru)
2. Получите логин и пароль
3. Обновите код в Edge Function

## Деплой Edge Function

```bash
# Войдите в Supabase
supabase login

# Деплой функции
supabase functions deploy send-sms

# Установите секреты (пример для SMS.ru)
supabase secrets set SMS_RU_API_KEY=your_api_key_here
```

## Применение миграции базы данных

```bash
# Локально (если используете локальный Supabase)
supabase migration up

# Или примените миграцию напрямую в Supabase Dashboard
# SQL Editor -> Вставьте содержимое 023_create_phone_verification_table.sql
```

## Dev Mode

В режиме разработки (пока не настроен SMS провайдер):
- Код подтверждения выводится в консоль браузера
- Код отображается в Toast сообщении
- Проверка кода работает через базу данных

## Безопасность

- Коды истекают через 10 минут
- Максимум 5 попыток ввода кода
- После подтверждения статус "verified" хранится 1 час
- Старые коды автоматически удаляются функцией `cleanup_expired_verification_codes()`

## Настройка автоочистки (опционально)

Создайте pg_cron задачу для автоматической очистки:

```sql
-- Включите расширение pg_cron (если еще не включено)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Создайте задачу для очистки каждые 30 минут
SELECT cron.schedule(
    'cleanup-expired-codes',
    '*/30 * * * *',
    $$SELECT cleanup_expired_verification_codes()$$
);
```
