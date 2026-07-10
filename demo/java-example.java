// Chartres Blue Theme Demo — Java 17+
// Modern Java with records, sealed classes, streams, generics, and annotations.

package dev.chartresblue.demo;

import java.time.Year;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

// === Enum ===

enum CathedralColor {
    CHARTRES_BLUE("#1A2A6C"),
    ROSE("#9B1B30"),
    GOLD("#C9A84C"),
    STONE("#8E8B82");

    private final String hex;

    CathedralColor(String hex) {
        this.hex = hex;
    }

    public String hex() { return hex; }

    public static Optional<CathedralColor> fromHex(String hex) {
        return Arrays.stream(values())
                .filter(c -> c.hex.equalsIgnoreCase(hex))
                .findFirst();
    }
}

// === Record (immutable data class) ===

record RGBA(int r, int g, int b, double a) {
    public RGBA {
        if (r < 0 || r > 255) throw new IllegalArgumentException("r out of range: " + r);
        if (a < 0.0 || a > 1.0) throw new IllegalArgumentException("a out of range: " + a);
    }

    public String toCss() {
        return String.format("rgba(%d, %d, %d, %.2f)", r, g, b, a);
    }
}

// === Sealed interface (Java 17+) ===

sealed interface Describable
        permits StainedGlass, GlassFragment {

    String describe();

    default String shortSummary() {
        String full = describe();
        return full.length() > 50 ? full.substring(0, 47) + "..." : full;
    }
}

// === Class with generics ===

final class StainedGlass implements Describable {
    private final String id;
    private final String name;
    private final int year;
    private final CathedralColor color;
    private final List<String> pigments;
    private final double widthCm;
    private final double heightCm;

    public StainedGlass(
            String id, String name, int year, CathedralColor color,
            List<String> pigments, double widthCm, double heightCm) {
        this.id = Objects.requireNonNull(id);
        this.name = Objects.requireNonNull(name);
        this.year = year;
        this.color = Objects.requireNonNull(color);
        this.pigments = List.copyOf(pigments); // immutable copy
        this.widthCm = widthCm;
        this.heightCm = heightCm;
    }

    public double area() { return widthCm * heightCm; }

    public int age() { return Year.now().getValue() - year; }

    @Override
    public String describe() {
        return String.format("%s (%d): %s — %.0f×%.0f cm",
                name, year, color, widthCm, heightCm);
    }

    // Getters
    public String id() { return id; }
    public String name() { return name; }
    public CathedralColor color() { return color; }
    public List<String> pigments() { return pigments; }
}

// === Another permitted subclass ===

record GlassFragment(String description, CathedralColor color)
        implements Describable {
    @Override
    public String describe() {
        return description + " [" + color.hex() + "]";
    }
}

// === Generic repository ===

class GlassCatalogue<T extends Describable> {
    private final Map<String, T> items = new LinkedHashMap<>();

    public void add(T item) {
        if (item instanceof StainedGlass sg) {
            items.put(sg.id(), item);
        }
    }

    public Optional<T> get(String id) {
        return Optional.ofNullable(items.get(id));
    }

    public List<T> filterByColor(CathedralColor color) {
        return items.values().stream()
                .filter(item -> item instanceof StainedGlass sg && sg.color() == color)
                .collect(Collectors.toUnmodifiableList());
    }

    public Map<CathedralColor, Long> countByColor() {
        return items.values().stream()
                .filter(item -> item instanceof StainedGlass)
                .map(item -> ((StainedGlass) item).color())
                .collect(Collectors.groupingBy(
                        c -> c,
                        Collectors.counting()
                ));
    }
}

// === Annotation ===

@java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
@interface JsonField {
    String name();
    boolean required() default false;
}

// === Main class ===

public class GlassDemo {
    private static final Pattern HEX_PATTERN =
            Pattern.compile("^#?([a-fA-F\\d]{2})([a-fA-F\\d]{2})([a-fA-F\\d]{2})$");

    @JsonField(name = "demo_version", required = true)
    private static final String VERSION = "0.1.0";

    public static void main(String[] args) {
        var catalogue = new GlassCatalogue<Describable>();

        var panel = new StainedGlass(
                "notre-dame-belle-verriere",
                "Notre-Dame de la Belle-Verrière",
                1180,
                CathedralColor.CHARTRES_BLUE,
                List.of("cobalt oxide", "copper sulfate"),
                240.0, 380.0
        );

        catalogue.add(panel);

        // Pattern matching switch (Java 17+)
        for (var item : List.<Describable>of(panel, new GlassFragment("Blue shard", CathedralColor.CHARTRES_BLUE))) {
            String output = switch (item) {
                case StainedGlass sg ->
                        String.format("Panel: %s (age: %d)", sg.name(), sg.age());
                case GlassFragment gf ->
                        "Fragment: " + gf.description();
            };
            System.out.println(output);
        }

        catalogue.get("notre-dame-belle-verriere").ifPresentOrElse(
                p -> System.out.println(p.shortSummary()),
                () -> System.err.println("Not found")
        );

        System.out.println("Counts: " + catalogue.countByColor());
    }
}
