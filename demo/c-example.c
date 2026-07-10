/*
 * Chartres Blue Theme Demo — C11
 * Comprehensive C sample with structs, unions, pointers, and preprocessor macros.
 */

#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* === Preprocessor constants & macros === */

#define MAX_NAME_LEN  256
#define MAX_PIGMENTS  16
#define ARRAY_SIZE(a) (sizeof(a) / sizeof((a)[0]))
#define HEX_TO_U8(hi, lo) \
    ((uint8_t)(((unsigned char)(hi) * 16 + (unsigned char)(lo)) & 0xFF))

#ifndef NDEBUG
#  define DEBUG_LOG(fmt, ...) \
    fprintf(stderr, "[DEBUG] %s:%d: " fmt "\n", __FILE__, __LINE__, ##__VA_ARGS__)
#else
#  define DEBUG_LOG(...) ((void)0)
#endif

/* === Enum === */

typedef enum {
    COLOR_CHARTRES_BLUE,
    COLOR_ROSE,
    COLOR_GOLD,
    COLOR_STONE,
    COLOR_COUNT,
} CathedralColor;

static const char* const color_names[] = {
    [COLOR_CHARTRES_BLUE] = "Chartres Blue",
    [COLOR_ROSE]          = "Rose",
    [COLOR_GOLD]          = "Gold",
    [COLOR_STONE]         = "Stone",
};

static const char* const color_hex[] = {
    [COLOR_CHARTRES_BLUE] = "#1A2A6C",
    [COLOR_ROSE]          = "#9B1B30",
    [COLOR_GOLD]          = "#C9A84C",
    [COLOR_STONE]         = "#8E8B82",
};

/* === Struct === */

typedef struct {
    uint8_t r, g, b;
    double  a;
} RGBA;

typedef struct {
    char            id[64];
    char            name[MAX_NAME_LEN];
    int             year;
    CathedralColor  color;
    double          width_cm;
    double          height_cm;
    char*           pigments[MAX_PIGMENTS];
    size_t          pigment_count;
    bool            restored;
} StainedGlass;

/* === Union === */

typedef union {
    int      as_int;
    double   as_double;
    uint32_t as_rgba32;  /* packed 8-bit ARGB */
} ColorValue;

/* === Function declarations === */

static double  panel_area(const StainedGlass* panel);
static int     panel_age(const StainedGlass* panel, int current_year);
static bool    parse_hex(const char* hex, RGBA* out);
static void    panel_describe(const StainedGlass* panel, char* buf, size_t buf_size);

/* === Dynamic array (opaque type) === */

typedef struct GlassCatalogue GlassCatalogue;

GlassCatalogue* catalogue_new(void);
void            catalogue_free(GlassCatalogue* cat);
bool            catalogue_add(GlassCatalogue* cat, const StainedGlass* panel);
const StainedGlass* catalogue_get(const GlassCatalogue* cat, const char* id);
size_t          catalogue_count(const GlassCatalogue* cat);

/* === Implementation === */

static double panel_area(const StainedGlass* panel) {
    return panel ? panel->width_cm * panel->height_cm : 0.0;
}

static int panel_age(const StainedGlass* panel, int current_year) {
    return panel ? current_year - panel->year : -1;
}

static bool parse_hex(const char* hex, RGBA* out) {
    if (!hex || !out) return false;

    const char* p = hex;
    if (*p == '#') p++;

    unsigned int r, g, b;
    if (sscanf(p, "%2x%2x%2x", &r, &g, &b) != 3) {
        return false;
    }
    out->r = (uint8_t)r;
    out->g = (uint8_t)g;
    out->b = (uint8_t)b;
    out->a = 1.0;
    return true;
}

static void panel_describe(const StainedGlass* panel, char* buf, size_t buf_size) {
    if (!panel || !buf) return;
    snprintf(buf, buf_size,
             "%s (%d): %s — %.0f×%.0f cm | pigments: %zu",
             panel->name, panel->year,
             color_hex[panel->color],
             panel->width_cm, panel->height_cm,
             panel->pigment_count);
}

struct GlassCatalogue {
    StainedGlass* panels;
    size_t        capacity;
    size_t        count;
};

GlassCatalogue* catalogue_new(void) {
    GlassCatalogue* cat = calloc(1, sizeof(*cat));
    if (!cat) {
        perror("calloc");
        return NULL;
    }
    cat->capacity = 8;
    cat->panels   = calloc(cat->capacity, sizeof(StainedGlass));
    if (!cat->panels) {
        free(cat);
        return NULL;
    }
    return cat;
}

void catalogue_free(GlassCatalogue* cat) {
    if (!cat) return;
    for (size_t i = 0; i < cat->count; i++) {
        for (size_t j = 0; j < cat->panels[i].pigment_count; j++) {
            free(cat->panels[i].pigments[j]);
        }
    }
    free(cat->panels);
    free(cat);
}

/* === Main === */

int main(void) {
    GlassCatalogue* cat = catalogue_new();
    if (!cat) return EXIT_FAILURE;

    StainedGlass panel = {
        .id         = "notre-dame-belle-verriere",
        .name       = "Notre-Dame de la Belle-Verrière",
        .year       = 1180,
        .color      = COLOR_CHARTRES_BLUE,
        .width_cm   = 240.0,
        .height_cm  = 380.0,
        .restored   = true,
    };

    /* Add pigments */
    panel.pigments[0] = strdup("cobalt oxide");
    panel.pigments[1] = strdup("copper sulfate");
    panel.pigment_count = 2;

    catalogue_add(cat, &panel);

    /* Describe */
    char desc[512];
    panel_describe(&panel, desc, sizeof(desc));
    printf("%s\n", desc);
    printf("Area: %.0f cm², Age: %d years\n",
           panel_area(&panel), panel_age(&panel, 2026));

    /* Parse hex */
    RGBA rgba = {0};
    if (parse_hex(color_hex[COLOR_CHARTRES_BLUE], &rgba)) {
        printf("rgba(%d, %d, %d, %.2f)\n", rgba.r, rgba.g, rgba.b, rgba.a);
    }

    /* Union example */
    ColorValue val = {.as_rgba32 = 0x1A2A6CFF};
    DEBUG_LOG("Packed color: 0x%08X, as double: %f", val.as_rgba32, val.as_double);

    /* Cleanup */
    catalogue_free(cat);
    return EXIT_SUCCESS;
}
