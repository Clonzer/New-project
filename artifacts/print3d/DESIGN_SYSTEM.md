# Synthix Modern Design System

## Overview
A sophisticated dark-themed design system featuring glassmorphism, vibrant gradients, and smooth animations.

## Color Palette

### Core Colors
- **Background**: Deep dark `hsl(240 10% 3%)` - Almost black with slight blue tint
- **Card**: Slightly elevated `hsl(240 10% 5%)` 
- **Foreground**: Clean white `hsl(0 0% 98%)`

### Primary Colors
- **Primary**: Vibrant violet `hsl(265 89% 58%)` - Main brand color
- **Primary Glow**: `rgba(139, 92, 246, 0.5)` - For shadow effects
- **Accent**: Cyan `hsl(187 92% 48%)` - Contrast and highlights

### Semantic Colors
- **Success**: Emerald green
- **Warning**: Amber/orange
- **Destructive**: Red for errors
- **Muted**: Subtle grays for secondary text

## Design Patterns

### 1. Glassmorphism
Three levels of glass effects:
```css
.glass          /* Light: rgba(255,255,255,0.03) */
.glass-dark     /* Dark: rgba(0,0,0,0.4) */
.glass-card     /* Gradient glass with blur */
```

### 2. Glow Effects
```css
.glow-primary   /* Violet shadow glow */
.glow-accent    /* Cyan shadow glow */
.glow-subtle    /* Soft ambient glow */
```

### 3. Gradient Text
```css
.gradient-text           /* Static violet-to-cyan */
.gradient-text-animated  /* Flowing gradient */
```

### 4. Hover Lift
```css
.hover-lift  /* Cards lift -4px on hover with shadow */
```

## Component Updates

### Button Variants
- `default` - Gradient primary with glow shadow
- `destructive` - Red gradient
- `outline` - Bordered with glass effect
- `secondary` - Subtle background
- `ghost` - Minimal hover effect
- `link` - Text with underline
- `gradient` - Full gradient background
- `glass` - Glassmorphism button

Sizes: `sm`, `default`, `lg`, `xl`, `icon`

### Card
- Gradient background from white/5% to white/2%
- Border: white/8% with hover to white/12%
- Backdrop blur: 20px
- Shadow: xl
- Transition: 300ms all

### Input
- Height: 44px (h-11)
- Border radius: 12px (rounded-xl)
- Background: white/3%
- Hover: white/5%
- Focus: Primary ring with border highlight

### Badge
- Rounded full (pill shape)
- Variants: default, secondary, destructive, outline, success, warning, glass
- Gradient backgrounds on primary variants

## Animation Classes

### Tailwind Animations
- `animate-float` - Gentle 6s floating motion
- `animate-pulse-glow` - Pulsing opacity and scale
- `animate-shimmer` - Loading shimmer effect
- `animate-fade-in` - Fade entrance
- `animate-slide-up` - Slide up entrance
- `animate-scale-in` - Scale entrance
- `animate-gradient-shift` - Background gradient flow

## Background Effects

### Global Page Background
```css
body {
  /* Multi-layer radial gradients for depth */
  /* 1. Violet glow top-left */
  /* 2. Cyan glow top-right */
  /* 3. Pink accent bottom */
  /* 4. Purple depth bottom-left */
  /* 5. Cyan depth bottom-right */
}
```

### Utility Classes

| Class | Effect |
|-------|--------|
| `glass` | Standard glassmorphism |
| `glass-dark` | Dark glass for overlays |
| `glass-card` | Card-specific glass |
| `glow-primary` | Violet shadow glow |
| `glow-accent` | Cyan shadow glow |
| `gradient-text` | Gradient text fill |
| `hover-lift` | Hover elevation |
| `transition-all-smooth` | Smooth transitions |
| `focus-ring` | Accessible focus ring |
| `shimmer` | Loading shimmer |

## Usage Examples

### Hero Section Badge
```tsx
<span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-semibold text-primary backdrop-blur-md">
  <Sparkles className="w-4 h-4" />
  Storefront marketplace
</span>
```

### Glass Card
```tsx
<Card className="glass-card hover-lift">
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Gradient Button
```tsx
<Button variant="gradient" size="lg" className="rounded-xl">
  Get Started <ArrowRight className="w-5 h-5 ml-2" />
</Button>
```

### Animated Heading
```tsx
<h1 className="text-5xl font-display font-bold">
  Your <span className="gradient-text-animated">Marketplace</span>
</h1>
```

## Typography

### Fonts
- **Display**: 'Outfit' - Headings, bold, tracking-tight
- **Body**: 'Plus Jakarta Sans' - UI text, clean legible
- **Fallback**: 'Inter' - System font stack

### Scale
- H1: text-5xl md:text-7xl lg:text-8xl
- H2: text-4xl md:text-5xl
- H3: text-2xl
- Body: text-base (16px)
- Small: text-sm

## Spacing & Radius

### Border Radius
- Cards: 16px (rounded-2xl)
- Buttons: 12px (rounded-xl)
- Badges: Full (rounded-full/pill)
- Inputs: 12px (rounded-xl)

### Shadows
- Cards: `shadow-xl`
- Buttons: `shadow-lg` with colored glow
- Elevated: `hover:shadow-2xl`

## Accessibility

### Focus States
- Visible focus rings with 2px offset
- Primary color for focus indicators
- Smooth focus transitions

### Color Contrast
- All text meets WCAG 4.5:1 ratio
- White text on dark backgrounds
- Primary color has sufficient contrast

## Migration Guide

### Old → New Classes

| Old | New |
|-----|-----|
| `bg-zinc-900/50` | `glass-card` or `bg-gradient-to-b from-white/[0.07] to-white/[0.02]` |
| `border-white/10` | `border-white/[0.08]` |
| `rounded-md` | `rounded-xl` |
| `hover:bg-white/5` | `hover:bg-white/[0.05]` |
| `shadow-[0_0_15px_rgba(139,92,246,0.4)]` | `glow-primary` |

### Component Props

**Button**:
- Use `variant="gradient"` for primary CTAs
- Use `variant="glass"` for secondary actions on dark backgrounds
- Add `className="group"` for icon animations

**Card**:
- Default Card now has glassmorphism built-in
- Add `className="hover-lift"` for interactive cards

**Badge**:
- Use `variant="glass"` for subtle badges
- Use `variant="success"` for status indicators
