-- ============================================
-- Chartres Blue Theme Demo — SQL (PostgreSQL)
-- ============================================

-- === DDL: Table creation ===

CREATE TABLE cathedrals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    city            VARCHAR(100) NOT NULL,
    country_code    CHAR(2) NOT NULL,
    unesco_id       VARCHAR(20) UNIQUE,
    year_built_from INTEGER CHECK (year_built_from > 0),
    year_built_to   INTEGER,
    style           TEXT[] NOT NULL DEFAULT '{}',
    coordinates     POINT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stained_glass_panels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cathedral_id    UUID NOT NULL REFERENCES cathedrals(id) ON DELETE CASCADE,
    name            VARCHAR(500) NOT NULL,
    year_created    INTEGER,
    location        VARCHAR(255),
    width_cm        NUMERIC(8,2),
    height_cm       NUMERIC(8,2),
    dominant_color  CHAR(7),              -- e.g. '#1A2A6C'
    condition       VARCHAR(20) CHECK (condition IN ('excellent','good','fair','poor','lost')),
    restored        BOOLEAN NOT NULL DEFAULT FALSE,
    metadata        JSONB DEFAULT '{}'
);

CREATE TABLE pigments (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    chemical_formula VARCHAR(50),
    hex_color       CHAR(7),
    rarity          VARCHAR(20) CHECK (rarity IN ('common','rare','legendary'))
);

-- Junction table
CREATE TABLE panel_pigments (
    panel_id    UUID REFERENCES stained_glass_panels(id) ON DELETE CASCADE,
    pigment_id  INTEGER REFERENCES pigments(id) ON DELETE RESTRICT,
    proportion  NUMERIC(4,3), -- 0.000 to 1.000
    PRIMARY KEY (panel_id, pigment_id)
);

-- === Indexes ===

CREATE INDEX idx_panels_cathedral ON stained_glass_panels(cathedral_id);
CREATE INDEX idx_panels_year ON stained_glass_panels(year_created)
    WHERE year_created IS NOT NULL;
CREATE INDEX idx_panels_color ON stained_glass_panels(dominant_color);
CREATE INDEX idx_panels_metadata ON stained_glass_panels USING GIN (metadata);

-- === Insert sample data ===

INSERT INTO cathedrals (name, city, country_code, unesco_id, style, year_built_from, year_built_to)
VALUES
    ('Cathédrale Notre-Dame de Chartres', 'Chartres', 'FR', '81bis',
     ARRAY['Gothic', 'Romanesque'], 1194, 1220),
    ('Cathédrale Notre-Dame de Paris', 'Paris', 'FR', '660',
     ARRAY['Gothic'], 1163, 1345);

INSERT INTO stained_glass_panels
    (cathedral_id, name, year_created, location, width_cm, height_cm, dominant_color, restored)
SELECT
    c.id,
    'Notre-Dame de la Belle-Verrière',
    1180,
    'South choir',
    240.00,
    380.00,
    '#1A2A6C',
    TRUE
FROM cathedrals c WHERE c.city = 'Chartres';

-- === CTE + Window function query ===

WITH color_stats AS (
    SELECT
        dominant_color,
        COUNT(*) AS panel_count,
        ROUND(AVG(year_created)) AS avg_year,
        SUM(width_cm * height_cm) / 10000.0 AS total_area_m2
    FROM stained_glass_panels
    WHERE year_created IS NOT NULL
    GROUP BY dominant_color
),
ranked AS (
    SELECT
        *,
        RANK() OVER (ORDER BY panel_count DESC) AS rank_by_count,
        DENSE_RANK() OVER (ORDER BY total_area_m2 DESC) AS rank_by_area
    FROM color_stats
)
SELECT
    dominant_color AS "Color",
    panel_count AS "Count",
    avg_year AS "Avg Year",
    ROUND(total_area_m2::numeric, 1) AS "Area (m²)",
    rank_by_count AS "Rank"
FROM ranked
WHERE rank_by_count <= 5
ORDER BY panel_count DESC;

-- === Subquery with EXISTS ===

SELECT c.name AS "Cathedral", p.name AS "Panel", p.year_created
FROM stained_glass_panels p
JOIN cathedrals c ON c.id = p.cathedral_id
WHERE EXISTS (
    SELECT 1 FROM panel_pigments pp
    JOIN pigments pg ON pg.id = pp.pigment_id
    WHERE pp.panel_id = p.id
      AND pg.rarity = 'legendary'
      AND pg.name ILIKE '%cobalt%'
)
ORDER BY p.year_created;

-- === UPDATE with RETURNING ===

UPDATE stained_glass_panels
SET restored = FALSE,
    metadata = jsonb_set(metadata, '{last_inspection}', to_jsonb(now()::text))
WHERE dominant_color = '#1A2A6C'
  AND year_created < 1200
RETURNING id, name, restored, metadata;

-- === EXPLAIN ANALYZE ===

EXPLAIN ANALYZE
SELECT dominant_color, COUNT(*)
FROM stained_glass_panels
WHERE dominant_color IS NOT NULL
GROUP BY dominant_color;
