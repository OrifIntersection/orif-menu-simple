-- Ajouter une table meal_items pour l'édition directe par date
-- Cette table permet d'éditer les menus jour par jour sans dépendre de la structure menu/menu_days

CREATE TABLE IF NOT EXISTS public.meal_items (
  id bigserial NOT NULL,
  date date NOT NULL,
  meal_type_id integer NOT NULL,
  category_id integer NOT NULL,
  dish_id integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT fk_meal_items_meal FOREIGN KEY (meal_type_id) REFERENCES public.meal_types(id),
  CONSTRAINT fk_meal_items_cat  FOREIGN KEY (category_id)  REFERENCES public.categories(id),
  CONSTRAINT fk_meal_items_dish FOREIGN KEY (dish_id)      REFERENCES public.dishes(id),
  CONSTRAINT unique_meal_assignment UNIQUE (date, meal_type_id, category_id)
);

-- Index pour optimiser les requêtes par date
CREATE INDEX IF NOT EXISTS idx_meal_items_date ON public.meal_items (date);

-- Politique RLS pour permettre l'accès public en lecture
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "public_read_meal_items" ON public.meal_items FOR SELECT USING (true);

-- Insérer quelques données de test pour aujourd'hui
INSERT INTO public.meal_items (date, meal_type_id, category_id, dish_id)
VALUES 
  -- Midi aujourd'hui
  (CURRENT_DATE, 1, 1, 1),  -- Entrée midi
  (CURRENT_DATE, 1, 2, 5),  -- Protéine midi
  (CURRENT_DATE, 1, 3, 10), -- Féculent midi
  -- Soir aujourd'hui  
  (CURRENT_DATE, 2, 1, 2),  -- Entrée soir
  (CURRENT_DATE, 2, 2, 7),  -- Protéine soir
  (CURRENT_DATE, 2, 3, 12)  -- Féculent soir
ON CONFLICT (date, meal_type_id, category_id) DO NOTHING;