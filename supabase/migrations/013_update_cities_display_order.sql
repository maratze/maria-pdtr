-- Update cities display order to: Moscow (1), Saint-Petersburg (2), Kazan (3), Novosibirsk (4)
UPDATE public.cities SET display_order = 1 WHERE slug = 'moscow';
UPDATE public.cities SET display_order = 2 WHERE slug = 'saint-petersburg';
UPDATE public.cities SET display_order = 3 WHERE slug = 'kazan';
UPDATE public.cities SET display_order = 4 WHERE slug = 'novosibirsk';
