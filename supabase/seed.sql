-- Gooflo Seed Data
-- Initial official mods + app_config defaults

-- App Config
INSERT INTO app_config (key, value, updated_at) VALUES
  ('minimum_app_version', '1.0.0', NOW()),
  ('maintenance_mode', 'false', NOW()),
  ('default_credit_cost', '1', NOW()),
  ('signup_bonus_credits', '20', NOW()),
  ('daily_login_credits', '3', NOW()),
  ('pro_daily_credits', '5', NOW()),
  ('share_bonus_credits', '2', NOW())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Official Mods (examples — thumbnails will be generated via Edge Function)
INSERT INTO mods (name, slug, prompt, category, type, is_prompt_public, is_premium, credit_cost) VALUES
  ('Anime Hero',         'anime-hero',        'Transform into a vibrant anime protagonist with large expressive eyes, colorful hair, and dynamic pose', 'anime',     'official', false, false, 1),
  ('Medieval Knight',    'medieval-knight',   'Transform into a medieval knight wearing full plate armor with a crest, dramatic lighting', 'fantasy',   'official', false, false, 1),
  ('Cyberpunk Hacker',   'cyberpunk-hacker',  'Transform into a cyberpunk hacker with neon lights, holographic tattoos, and futuristic cityscape', 'cyberpunk', 'official', false, false, 1),
  ('Oil Painting',       'oil-painting',      'Transform into a classic oil painting portrait in the style of Renaissance masters, rich textures', 'art',       'official', false, false, 1),
  ('Space Explorer',     'space-explorer',    'Transform into an astronaut in a sleek futuristic space suit against a nebula backdrop', 'sci-fi',    'official', false, false, 1),
  ('Viking Warrior',     'viking-warrior',    'Transform into a fierce Nordic viking warrior with fur cloak, braided hair, and dramatic winter scenery', 'fantasy', 'official', false, false, 1),
  ('Pop Art',            'pop-art',           'Transform into a bold pop art portrait in the style of Roy Lichtenstein with bright colors and halftone dots', 'art', 'official', false, false, 1),
  ('Steampunk Engineer', 'steampunk-engineer','Transform into a Victorian-era steampunk engineer with brass goggles, gears, and mechanical wings', 'steampunk', 'official', false, false, 1),
  ('Watercolor Dream',   'watercolor-dream',  'Transform into a soft watercolor painting portrait with delicate brushstrokes and dreamy pastel colors', 'art',    'official', false, false, 1),
  ('Dark Fantasy Mage',  'dark-fantasy-mage', 'Transform into a powerful dark fantasy mage with mystical robes, glowing spell effects, and dramatic shadows', 'fantasy', 'official', false, true, 2)
ON CONFLICT (slug) DO NOTHING;
