// Chartres Blue Theme Demo — C++20
// Modern C++ with templates, concepts, smart pointers, ranges, and modules-era style.

#include <algorithm>
#include <chrono>
#include <concepts>
#include <format>
#include <iostream>
#include <map>
#include <memory>
#include <optional>
#include <regex>
#include <ranges>
#include <span>
#include <string>
#include <string_view>
#include <vector>

// === Concept ===

template <typename T>
concept Describable = requires(const T& t) {
    { t.describe() } -> std::convertible_to<std::string>;
    { t.id() } -> std::convertible_to<std::string_view>;
};

// === Enum class ===

enum class CathedralColor : uint8_t {
    ChartresBlue,
    Rose,
    Gold,
    Stone,
};

constexpr std::string_view to_hex(CathedralColor c) noexcept {
    using enum CathedralColor;
    switch (c) {
        case ChartresBlue: return "#1A2A6C";
        case Rose:         return "#9B1B30";
        case Gold:         return "#C9A84C";
        case Stone:        return "#8E8B82";
    }
    return "#000000";
}

// === Struct ===

struct RGBA {
    uint8_t r, g, b;
    double a{1.0};

    [[nodiscard]] std::string to_css() const {
        return std::format("rgba({}, {}, {}, {:.2f})", r, g, b, a);
    }
};

// === Class with rule-of-five ===

class StainedGlass {
public:
    StainedGlass(std::string id, std::string name, int year,
                 CathedralColor color, std::vector<std::string> pigments,
                 double width_cm, double height_cm)
        : id_(std::move(id)), name_(std::move(name)), year_(year),
          color_(color), pigments_(std::move(pigments)),
          width_cm_(width_cm), height_cm_(height_cm) {}

    // Rule of five
    ~StainedGlass() = default;
    StainedGlass(const StainedGlass&) = default;
    StainedGlass& operator=(const StainedGlass&) = default;
    StainedGlass(StainedGlass&&) noexcept = default;
    StainedGlass& operator=(StainedGlass&&) noexcept = default;

    [[nodiscard]] std::string_view id() const { return id_; }
    [[nodiscard]] std::string describe() const {
        return std::format("{} ({}): {} — {:.0f}×{:.0f} cm",
                           name_, year_, to_hex(color_), width_cm_, height_cm_);
    }
    [[nodiscard]] double area() const { return width_cm_ * height_cm_; }
    [[nodiscard]] int age(int current_year) const { return current_year - year_; }

private:
    std::string id_;
    std::string name_;
    int year_;
    CathedralColor color_;
    std::vector<std::string> pigments_;
    double width_cm_;
    double height_cm_;
};

// === Template class with constraints ===

template <Describable T>
class GlassCatalogue {
public:
    void add(T item) {
        items_.emplace(std::string{item.id()}, std::move(item));
    }

    [[nodiscard]] std::optional<std::reference_wrapper<const T>>
    get(std::string_view id) const {
        auto it = items_.find(std::string{id});
        if (it != items_.end()) return std::cref(it->second);
        return std::nullopt;
    }

    [[nodiscard]] std::vector<const T*> filter_by_color(
            CathedralColor color, std::type_identity_t<T>* = nullptr) const {
        // Placeholder — real impl would need color accessor
        std::vector<const T*> result;
        for (const auto& [_, item] : items_) {
            result.push_back(&item);
        }
        return result;
    }

    [[nodiscard]] size_t size() const { return items_.size(); }

    // Range-based access
    auto items() const {
        return items_ | std::views::values;
    }

private:
    std::map<std::string, T, std::less<>> items_;
};

// === Template function ===

template <typename T>
    requires std::integral<T> || std::floating_point<T>
[[nodiscard]] constexpr auto square(T x) noexcept -> decltype(x* x) {
    return x * x;
}

// === Regex helper ===

[[nodiscard]] std::optional<RGBA> parse_hex(std::string_view hex) {
    static const std::regex pattern(
        R"(^#?([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})$)",
        std::regex::optimize
    );
    std::match_results<std::string_view::const_iterator> match;
    if (!std::regex_match(hex.cbegin(), hex.cend(), match, pattern)) {
        return std::nullopt;
    }
    return RGBA{
        .r = static_cast<uint8_t>(std::stoi(match[1].str(), nullptr, 16)),
        .g = static_cast<uint8_t>(std::stoi(match[2].str(), nullptr, 16)),
        .b = static_cast<uint8_t>(std::stoi(match[3].str(), nullptr, 16)),
    };
}

// === Main ===

int main() {
    auto catalogue = GlassCatalogue<StainedGlass>{};

    catalogue.add(StainedGlass(
        "notre-dame-belle-verriere",
        "Notre-Dame de la Belle-Verrière",
        1180,
        CathedralColor::ChartresBlue,
        {"cobalt oxide", "copper sulfate"},
        240.0, 380.0
    ));

    // Structured binding
    if (auto panel = catalogue.get("notre-dame-belle-verriere")) {
        const auto& p = panel->get();
        std::cout << p.describe() << '\n';
        std::cout << std::format("Age: {} years, Area: {:.0f} cm²\n",
                                 p.age(2026), p.area());
    }

    // Ranges pipeline
    namespace rv = std::views;
    auto areas = catalogue.items()
               | rv::transform([](const auto& p) { return p.area(); })
               | rv::filter([](double a) { return a > 1000.0; });

    for (double a : areas) {
        std::cout << std::format("Large panel: {:.0f} cm²\n", a);
    }

    // Optional monadic operations (C++23)
    auto rgba = parse_hex("#1A2A6C")
        .and_then([](const RGBA& c) -> std::optional<RGBA> {
            // Validate
            if (c.r + c.g + c.b == 0) return std::nullopt;
            return c;
        })
        .transform([](const RGBA& c) { return c.to_css(); });

    if (rgba) std::cout << *rgba << '\n';

    std::cout << "Square of 42: " << square(42) << '\n';
    return 0;
}
