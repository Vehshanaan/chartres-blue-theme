// Chartres Blue Theme Demo — Go
// A comprehensive Go sample with structs, interfaces, goroutines, and error handling.

package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"os"
	"regexp"
	"sync"
	"time"
)

// === Constants (iota) ===

type Condition int

const (
	ConditionExcellent Condition = iota + 1
	ConditionGood
	ConditionFair
	ConditionPoor
	ConditionLost
)

func (c Condition) String() string {
	names := [...]string{"unknown", "excellent", "good", "fair", "poor", "lost"}
	if int(c) < len(names) {
		return names[c]
	}
	return "unknown"
}

// === Struct with tags ===

type StainedGlass struct {
	ID            string    `json:"id"           validate:"required,uuid"`
	Name          string    `json:"name"         validate:"required"`
	Year          int       `json:"year"         validate:"gt=0,lte=2026"`
	Color         string    `json:"color"        validate:"hexcolor"`
	WidthCm       float64   `json:"widthCm"`
	HeightCm      float64   `json:"heightCm"`
	Pigments      []string  `json:"pigments,omitempty"`
	Condition     Condition `json:"condition"`
	Restored      bool      `json:"restored"`
	LastInspected time.Time `json:"lastInspected"`
}

// === Interface ===

type Describer interface {
	Describe() string
	Age(currentYear int) int
}

func (s *StainedGlass) Describe() string {
	return fmt.Sprintf("%s (%d): %s — %.0f×%.0f cm",
		s.Name, s.Year, s.Color, s.WidthCm, s.HeightCm)
}

func (s *StainedGlass) Age(currentYear int) int {
	return currentYear - s.Year
}

func (s *StainedGlass) Area() float64 {
	return s.WidthCm * s.HeightCm
}

// === Error sentinel ===

var (
	ErrNotFound     = errors.New("panel not found")
	ErrInvalidColor = errors.New("invalid color hex")
)

// === Generic Catalogue ===

type GlassCatalogue struct {
	mu     sync.RWMutex
	panels map[string]*StainedGlass
}

func NewCatalogue() *GlassCatalogue {
	return &GlassCatalogue{
		panels: make(map[string]*StainedGlass),
	}
}

func (c *GlassCatalogue) Add(p *StainedGlass) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.panels[p.ID] = p
}

func (c *GlassCatalogue) Get(id string) (*StainedGlass, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	p, ok := c.panels[id]
	if !ok {
		return nil, fmt.Errorf("%w: %s", ErrNotFound, id)
	}
	return p, nil
}

func (c *GlassCatalogue) FilterByColor(color string) []*StainedGlass {
	c.mu.RLock()
	defer c.mu.RUnlock()
	var result []*StainedGlass
	for _, p := range c.panels {
		if p.Color == color {
			result = append(result, p)
		}
	}
	return result
}

// === Goroutine example ===

func (c *GlassCatalogue) TotalArea(ctx context.Context) float64 {
	type result struct {
		total float64
	}

	ch := make(chan result, 1)

	go func() {
		c.mu.RLock()
		defer c.mu.RUnlock()
		var sum float64
		for _, p := range c.panels {
			sum += p.Area()
		}
		ch <- result{total: sum}
	}()

	select {
	case r := <-ch:
		return r.total
	case <-ctx.Done():
		log.Println("TotalArea: context cancelled")
		return 0
	}
}

// === Regex parsing ===

var hexPattern = regexp.MustCompile(`^#?([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})$`)

type RGB struct{ R, G, B uint8 }

func ParseHex(hex string) (*RGB, error) {
	matches := hexPattern.FindStringSubmatch(hex)
	if matches == nil {
		return nil, ErrInvalidColor
	}
	return &RGB{
		R: uint8(mustParseInt(matches[1], 16)),
		G: uint8(mustParseInt(matches[2], 16)),
		B: uint8(mustParseInt(matches[3], 16)),
	}, nil
}

func mustParseInt(s string, base int) int {
	var result int
	fmt.Sscanf(s, "%x", &result)
	return result
}

// === Defer & file handling ===

func SaveToFile(filename string, data any) (err error) {
	f, err := os.Create(filename)
	if err != nil {
		return fmt.Errorf("create file: %w", err)
	}
	defer func() {
		if closeErr := f.Close(); closeErr != nil && err == nil {
			err = closeErr
		}
	}()

	encoder := json.NewEncoder(f)
	encoder.SetIndent("", "  ")
	return encoder.Encode(data)
}

// === Main ===

func main() {
	catalogue := NewCatalogue()

	panel := &StainedGlass{
		ID:       "notre-dame-belle-verriere",
		Name:     "Notre-Dame de la Belle-Verrière",
		Year:     1180,
		Color:    "#1A2A6C",
		WidthCm:  240.0,
		HeightCm: 380.0,
		Pigments: []string{"cobalt oxide", "copper sulfate"},
		Condition: ConditionExcellent,
		Restored:  true,
	}
	catalogue.Add(panel)

	// Type assertion
	var d Describer = panel
	fmt.Println(d.Describe())

	// Error handling
	if _, err := catalogue.Get("unknown"); errors.Is(err, ErrNotFound) {
		log.Printf("Expected: %v", err)
	}

	// Context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 100*time.Millisecond)
	defer cancel()

	area := catalogue.TotalArea(ctx)
	fmt.Printf("Total area: %.0f cm²\n", math.Round(area))
}
