//! Chartres Blue Theme Demo — Rust
//! A comprehensive Rust sample with traits, generics, lifetimes, and error handling.

use std::collections::HashMap;
use std::fmt::{self, Display, Formatter};
use std::num::ParseIntError;
use std::str::FromStr;

// === Enum with data ===

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum CathedralColor {
    ChartresBlue,
    Rose,
    Gold,
    Stone,
}

impl CathedralColor {
    pub fn hex(&self) -> &'static str {
        match self {
            Self::ChartresBlue => "#1A2A6C",
            Self::Rose => "#9B1B30",
            Self::Gold => "#C9A84C",
            Self::Stone => "#8E8B82",
        }
    }

    pub fn from_hex(hex: &str) -> Option<Self> {
        match hex.to_uppercase().as_str() {
            "#1A2A6C" | "1A2A6C" => Some(Self::ChartresBlue),
            "#9B1B30" | "9B1B30" => Some(Self::Rose),
            "#C9A84C" | "C9A84C" => Some(Self::Gold),
            _ => None,
        }
    }
}

impl Display for CathedralColor {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "{:?} ({})", self, self.hex())
    }
}

// === Struct with generics & lifetimes ===

#[derive(Debug, Clone)]
pub struct StainedGlass<'a, T> {
    pub id: String,
    pub name: &'a str,
    pub year: u16,
    pub color: CathedralColor,
    pub pigments: Vec<T>,
    pub dimensions: (f64, f64),
}

impl<'a, T: Display> StainedGlass<'a, T> {
    pub fn new(
        id: impl Into<String>,
        name: &'a str,
        year: u16,
        color: CathedralColor,
        dimensions: (f64, f64),
    ) -> Self {
        Self {
            id: id.into(),
            name,
            year,
            color,
            pigments: Vec::new(),
            dimensions,
        }
    }

    pub fn area(&self) -> f64 {
        self.dimensions.0 * self.dimensions.1
    }

    pub fn age(&self, current_year: u16) -> u16 {
        current_year.saturating_sub(self.year)
    }
}

// === Trait ===

trait Describable {
    fn describe(&self) -> String;
    fn short_summary(&self) -> String {
        format!("{}...", &self.describe()[..40.min(self.describe().len())])
    }
}

impl<'a, T: Display> Describable for StainedGlass<'a, T> {
    fn describe(&self) -> String {
        format!(
            "{} ({}, {}): {} — area: {:.1} cm²",
            self.name,
            self.year,
            self.color,
            self.id,
            self.area()
        )
    }
}

// === Error handling ===

#[derive(Debug)]
pub enum GlassError {
    NotFound { id: String },
    InvalidColor(String),
    ParseError(ParseIntError),
}

impl Display for GlassError {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            Self::NotFound { id } => write!(f, "Panel not found: {id}"),
            Self::InvalidColor(hex) => write!(f, "Invalid color hex: {hex}"),
            Self::ParseError(e) => write!(f, "Parse error: {e}"),
        }
    }
}

impl std::error::Error for GlassError {}

impl From<ParseIntError> for GlassError {
    fn from(e: ParseIntError) -> Self {
        Self::ParseError(e)
    }
}

// === Result type alias ===

type GlassResult<T> = Result<T, GlassError>;

// === Catalogue with HashMap ===

pub struct GlassCatalogue<'a, T> {
    panels: HashMap<String, StainedGlass<'a, T>>,
}

impl<'a, T: Display> GlassCatalogue<'a, T> {
    pub fn new() -> Self {
        Self {
            panels: HashMap::new(),
        }
    }

    pub fn add(&mut self, panel: StainedGlass<'a, T>) {
        self.panels.insert(panel.id.clone(), panel);
    }

    pub fn get(&self, id: &str) -> GlassResult<&StainedGlass<'a, T>> {
        self.panels
            .get(id)
            .ok_or_else(|| GlassError::NotFound { id: id.to_owned() })
    }

    pub fn filter_by_color(&self, color: CathedralColor) -> Vec<&StainedGlass<'a, T>> {
        self.panels
            .values()
            .filter(|p| p.color == color)
            .collect()
    }
}

// === Async function ===

async fn fetch_panels(url: &str) -> reqwest::Result<String> {
    let client = reqwest::Client::new();
    let response = client
        .get(url)
        .header("Accept", "application/json")
        .send()
        .await?;
    response.text().await
}

// === Main ===

fn main() -> GlassResult<()> {
    let mut catalogue = GlassCatalogue::new();

    let panel = StainedGlass::new(
        "notre-dame-belle-verriere",
        "Notre-Dame de la Belle-Verrière",
        1180,
        CathedralColor::ChartresBlue,
        (240.0, 380.0),
    );

    println!("{}", panel.describe());
    println!("Age: {} years", panel.age(2026));

    catalogue.add(panel);

    let blue_panels = catalogue.filter_by_color(CathedralColor::ChartresBlue);
    println!("Chartres Blue panels: {}", blue_panels.len());

    Ok(())
}
