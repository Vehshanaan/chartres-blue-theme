#!/usr/bin/env bash
# ============================================
# Chartres Blue Theme Demo — Bash
# Comprehensive shell script with functions,
# arrays, conditionals, and error handling.
# ============================================

set -euo pipefail
IFS=$'\n\t'

# === Constants ===

readonly SCRIPT_NAME="$(basename "${0}")"
readonly SCRIPT_DIR="$(cd "$(dirname "${0}")" && pwd)"
readonly CHARTES_BLUE='#1A2A6C'
readonly ROSE='#9B1B30'
readonly GOLD='#C9A84C'

# === Color helpers ===

declare -A THEME_COLORS=(
    [background]='#111622'
    [foreground]='#D6E2F0'
    [keyword]='#6B8FD4'
    [string]='#2D6B4F'
    [comment]='#525A6D'
    [error]='#C7364A'
)

color_hex_to_rgb() {
    local hex="${1#\#}"
    local r g b
    r=$((16#${hex:0:2}))
    g=$((16#${hex:2:2}))
    b=$((16#${hex:4:2}))
    printf 'rgb(%d, %d, %d)\n' "${r}" "${g}" "${b}"
}

# === Logging functions ===

log_info()  { printf '\033[34m[INFO]\033[0m  %s\n' "${*}"; }
log_warn()  { printf '\033[33m[WARN]\033[0m  %s\n' "${*}" >&2; }
log_error() { printf '\033[31m[ERROR]\033[0m %s\n' "${*}" >&2; }
log_debug() {
    if [[ "${DEBUG:-0}" -eq 1 ]]; then
        printf '\033[90m[DEBUG]\033[0m %s\n' "${*}"
    fi
}

# === Function: parse theme JSON ===

count_token_colors() {
    local theme_file="${1:-themes/chartres-blue-dark.json}"
    if [[ ! -f "${theme_file}" ]]; then
        log_error "Theme file not found: ${theme_file}"
        return 1
    fi

    # Use jq if available, fallback to grep
    if command -v jq &>/dev/null; then
        jq '.tokenColors | length' "${theme_file}"
    else
        log_warn "jq not found, using grep fallback"
        grep -c '"name"' "${theme_file}" || true
    fi
}

# === Function: check contrast ratio ===

check_contrast() {
    local bg="${1}"
    local fg="${2}"

    # Simple relative luminance (sRGB approx)
    luminance() {
        local c="${1}"
        c=$(bc <<< "scale=4; ${c} / 255")
        if (( $(bc <<< "${c} <= 0.03928") )); then
            bc <<< "scale=4; ${c} / 12.92"
        else
            bc <<< "scale=4; ((${c} + 0.055) / 1.055) ^ 2.4"
        fi
    }

    log_info "Checking contrast: ${fg} on ${bg}"
    echo "TODO: full WCAG contrast calculation"
}

# === Array manipulation ===

list_panels() {
    local -a panels=(
        "notre-dame-belle-verriere:1180:${CHARTES_BLUE}"
        "rose-window-north:1230:${CHARTES_BLUE}"
        "zodiac-labours:1217:${GOLD}"
    )

    for entry in "${panels[@]}"; do
        IFS=':' read -r name year color <<< "${entry}"
        printf '  %-35s | %4s | %s\n' "${name}" "${year}" "${color}"
    done
}

# === Process substitution & here-doc ===

generate_report() {
    local out="${1:-/dev/stdout}"

    cat > "${out}" <<'REPORT_EOF'
╔══════════════════════════════════════════╗
║     Chartres Blue Theme — Report        ║
╚══════════════════════════════════════════╝

Colors defined:
REPORT_EOF

    for key in "${!THEME_COLORS[@]}"; do
        printf '  %-15s %s\n' "${key}" "${THEME_COLORS[${key}]}"
    done >> "${out}"
}

# === Trap ===

cleanup() {
    local exit_code=$?
    log_debug "Cleaning up (exit code: ${exit_code})"
    # Remove temp files, etc.
}
trap cleanup EXIT

# === Main ===

main() {
    local theme_file="${1:-}"

    log_info "=== Chartres Blue Theme Demo ==="
    log_info "Script: ${SCRIPT_NAME} in ${SCRIPT_DIR}"

    # Conditional with regex
    if [[ "${theme_file}" =~ \.json$ ]]; then
        local count
        count=$(count_token_colors "${theme_file}")
        log_info "Token colors: ${count}"
    else
        log_warn "No JSON theme file provided"
    fi

    # Convert sample color
    local rgb
    rgb=$(color_hex_to_rgb "${CHARTES_BLUE}")
    log_info "Chartres Blue: ${CHARTES_BLUE} → ${rgb}"

    # Array demo
    echo ""
    echo "Stained glass panels:"
    list_panels

    # Arithmetic
    local current_year=2026
    local built_year=1194
    local age=$((current_year - built_year))
    log_info "Cathedral age: ${age} years (since ${built_year})"

    # Case statement
    case "${OSTYPE}" in
        linux*)   log_info "Linux detected" ;;
        darwin*)  log_info "macOS detected" ;;
        msys*|cygwin*) log_info "Windows (MSYS/Cygwin) detected" ;;
        *)        log_warn "Unknown OS: ${OSTYPE}" ;;
    esac
}

main "${@}"
