# Makefile — Chartres Blue Stained Glass build helpers
# ====================================================

CC      := gcc
CFLAGS  := -Wall -O2 -std=c11
SRCDIR  := src
BUILDDIR:= build
SOURCES := $(wildcard $(SRCDIR)/*.c)
OBJECTS := $(patsubst $(SRCDIR)/%.c,$(BUILDDIR)/%.o,$(SOURCES))
TARGET  := $(BUILDDIR)/chartres-blue.out

.PHONY: all clean install

all: $(TARGET)

$(TARGET): $(OBJECTS)
	$(CC) $(CFLAGS) -o $@ $^

$(BUILDDIR)/%.o: $(SRCDIR)/%.c
	$(CC) $(CFLAGS) -c -o $@ $<

# Conditional: debug build
ifeq ($(DEBUG),1)
CFLAGS += -g -DDEBUG
endif

# Install helper (phony)
install:
	cp $(TARGET) /usr/local/bin/

clean:
	rm -f $(OBJECTS) $(TARGET)

# File count utility (not a real build step)
count:
	@echo "Source files: $(words $(SOURCES))"
	@wc -l $(SOURCES)
