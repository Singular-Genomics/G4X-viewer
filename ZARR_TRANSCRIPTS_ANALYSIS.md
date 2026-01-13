# Analiza Struktury Transcripts w Zarr

## 🎯 Podsumowanie

Dataset Zarr zawiera transkrypty spatial transcriptomics zorganizowane w strukturę piramidy (p0-p4) z podziałem na tiles. Każdy tile zawiera ~6,000-12,000 transkryptów w 3 tablicach: `cell_id`, `gene_name`, `position`.

**Kluczowe liczby:**

- **Poziomy piramidy**: 5 (p0-p4)
- **Całkowita liczba tiles**: 238
- **Rozmiar tile**: **60-95 KB**
- **Transkryptów na tile**: 6,700-12,000
- **Rozmiar obrazu**: ~3,300-4,100 pikseli (zależy od poziomu)

---

## 📐 Rozmiar Obrazu i Tiles

### Wymiary dla każdego poziomu:

| Poziom | Grid Tiles  | Tile Size    | Rozmiar Obrazu       |
| ------ | ----------- | ------------ | -------------------- |
| p0     | 13×13 (169) | 256×256 px   | **3,328 × 3,328 px** |
| p1     | 7×7 (49)    | 512×512 px   | 3,584 × 3,584 px     |
| p2     | 4×4 (16)    | 1024×1024 px | 4,096 × 4,096 px     |
| p3     | 2×2 (4)     | 2048×2048 px | 4,096 × 4,096 px     |
| p4     | 1×1 (1)     | 4096×4096 px | 4,096 × 4,096 px     |

**Uwaga**: Rozmiary obrazu są przybliżone - faktyczny rozmiar zależy od danych w datasecie.

---

## 📁 Struktura Katalogów

```
g4x.zarr/transcripts/tiles/
├── p0/  [13×13 grid = 169 tiles, 256px/tile]
├── p1/  [7×7 grid = 49 tiles, 512px/tile]
├── p2/  [4×4 grid = 16 tiles, 1024px/tile]
├── p3/  [2×2 grid = 4 tiles, 2048px/tile]
└── p4/  [1×1 grid = 1 tile, 4096px/tile]
```

**Konwencja nazewnictwa:**

- Format: `p{level}/y{yy}/x{xx}/`
- Zero-padded do 2 cyfr: `p0/y02/x03`
- **Tile bounds**:
  - Tile `y02/x03` zawiera punkty: `position[0]` ∈ [512, 767], `position[1]` ∈ [768, 1023]

---

## 📊 Struktura Danych w Tile

Każdy tile zawiera **3 tablice Zarr**:

### 1. `cell_id/`

- Format: `int32`
- Shape: `(N, 1)`
- Wartość: ID komórki lub `0` (brak przypisania)

### 2. `gene_name/`

- Format: `<U10` (Unicode string, UTF-32LE, max 10 znaków)
- Shape: `(N, 1)`
- Chunking: wielochunkowy (2 chunki po ~3336 elementów)

⚠️ **Uwaga**: Klient planuje zmienić na integer index + metadata w `.zattrs` (oszczędność ~35 KB/tile)

### 3. `position/`

- Format: `int32`
- Shape: `(N, 2)` - współrzędne [Y, X] ⚠️
- Wartość: pozycja w pikselach

⚠️ **UWAGA**: Współrzędne są w formacie **[Y, X]** a nie [X, Y]:

- `position[i, 0]` = współrzędna Y
- `position[i, 1]` = współrzędna X

---

## ⚠️ KLUCZOWA OBSERWACJA: Rozmieszczenie Punktów

**PUNKTY SĄ ROZRZUCONE NIERÓWNOMIERNIE:**

- Tylko **~8-10% powierzchni tile** zawiera dane
- Transkrypty skupione w **klastrach** (biologiczne komórki)
- **Duże obszary są puste**
- Im niższy poziom piramidy, tym bardziej rozproszone

**Przykład (p0/y02/x03):**

- Zakres tile: 256×256 px
- 12,046 transkryptów
- Zajęte: 16 z 192 komórek siatki (8.3%)
- 452-969 transkryptów w zajętych obszarach

**Czy punkty wychodzą poza granice tile?**
✅ **NIE** - wszystkie punkty mieszczą się w granicach swojego tile (sprawdzone dla p0, p2, p3, p4)

---

## 🛠️ Dostęp do Danych

### Python

```python
import zarr

g = zarr.open('g4x.zarr', mode='r')

# Tile (2, 3) → y02/x03
tx_tile = (2, 3)
tile_y = str(tx_tile[0]).zfill(2)
tile_x = str(tx_tile[1]).zfill(2)

tile = g['transcripts']['tiles']['p0'][f'y{tile_y}'][f'x{tile_x}']
cell_ids = tile['cell_id'][:]
gene_names = tile['gene_name'][:]
positions = tile['position'][:]
```

⚠️ **Uwagi**:

- deck.gl używa (z, x, y), Zarr ma (z, y, x) - konwersja w `ZarrTranscriptLoader`
- Współrzędne w Zarr: `position[0]` = Y, `position[1]` = X

---

_Analiza: 2026-01-13_
