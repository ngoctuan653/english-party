# 🎨 EnglishParty — UI Design Rules

> **Mục đích:** File này là **quy tắc thiết kế bắt buộc** cho toàn bộ ứng dụng.
> Bất kỳ ai (developer hoặc AI agent) khi tạo/chỉnh sửa giao diện **PHẢI** đọc file này trước.

---

## 1. Nguyên Tắc Cốt Lõi

### 1.1. ĐƠN NHẤT — Không Có "Web Trong Web"
- **KHÔNG BAO GIỜ** tạo trang con với background toàn trang khác biệt hệ thống (VD: `bg-[#0F172A]` tối trong hệ thống sáng).
- Mọi trang **ĐỀU** nằm trong `AppLayout` → sử dụng `bg-surface-base` (`#F5F5F7`) làm nền chính.
- Trang con **KHÔNG** dùng `min-h-screen` với background riêng — layout đã xử lý rồi.

### 1.2. LIỀN MẠCH — Seamless Module Transition
- Chuyển từ English → Chinese → bất kỳ module nào đều phải cảm giác như **cùng 1 ứng dụng**.
- Dùng **accent color** khác nhau để phân biệt module, KHÔNG phải background khác.
- Chinese module: accent `rose-500` / `rose-600`
- English module: accent `primary` (`#0071E3`) / `sky`

---

## 2. Color Palette — Bảng Màu Hệ Thống

### 2.1. Surface (Nền)
| Token | Giá trị | Dùng cho |
|-------|---------|----------|
| `surface-base` | `#F5F5F7` | Nền trang chính |
| `surface-card` | `#FFFFFF` | Card, panel |
| `surface-elevated` | `#E8E8ED` | Nền nổi, section tối hơn |
| `surface-hover` | `#E8E8ED` | Hover state |

### 2.2. Text
| Token | Giá trị | Dùng cho |
|-------|---------|----------|
| `text-primary` | `#1D1D1F` | Tiêu đề, text chính |
| `text-secondary` | `#6E6E73` | Mô tả, label |
| `text-muted` | `#86868B` | Hint, placeholder |

### 2.3. Module Accent Colors
| Module | Primary | Light | Gradient |
|--------|---------|-------|----------|
| English | `#0071E3` | `#3595FF` | `135deg, #0071E3 → #3595FF` |
| Chinese | `#E11D48` (rose-600) | `#FB7185` (rose-400) | `135deg, #E11D48 → #FB7185` |

### 2.4. Status Colors
| Status | Color |
|--------|-------|
| Success | `#34C759` |
| Warning | `#FF9500` |
| Danger | `#FF3B30` |
| Info | `#0071E3` |

### 2.5. HSK Level Colors (Chinese Module)
| Level | Badge BG | Badge Text | Border |
|-------|----------|------------|--------|
| HSK 1 | `rose-50` | `rose-600` | `rose-200` |
| HSK 2 | `amber-50` | `amber-600` | `amber-200` |
| HSK 3 | `purple-50` | `purple-600` | `purple-200` |
| HSK 4 | `blue-50` | `blue-600` | `blue-200` |

---

## 3. Typography — Font Chữ

- **Font:** `'Inter', system-ui, -apple-system, sans-serif`
- **KHÔNG** import font khác ngoài Inter
- **KHÔNG** dùng serif font

### 3.1. Heading Scale
| Element | Class | Weight |
|---------|-------|--------|
| Page Title | `text-2xl sm:text-3xl font-black` | 900 |
| Section Title | `text-lg sm:text-xl font-bold` | 700 |
| Card Title | `text-base font-bold` | 700 |
| Subtitle | `text-sm text-text-secondary` | 400 |
| Caption | `text-xs text-text-muted` | 400 |

---

## 4. Card Component — Quy Tắc Card

### 4.1. Standard Card
```
bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6
shadow-sm hover:shadow-md transition-shadow
```

### 4.2. Interactive Card (Link/Button)
```
bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6
shadow-sm hover:shadow-md hover:border-{accent}-300
transition-all group cursor-pointer
```

### 4.3. Highlighted/Hero Card
```
bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6
shadow-sm card-pattern
```

### 4.4. CẤM
- ❌ `bg-slate-900`, `bg-slate-950`, `bg-[#0F172A]` cho card
- ❌ `text-white`, `text-slate-100` cho card text (trừ khi card có gradient bg)
- ❌ `border-slate-700`, `border-slate-800` cho card border

---

## 5. Button Style — Nút Bấm

### 5.1. Primary Button
```
px-5 py-2.5 rounded-xl bg-gradient-to-r from-{accent} to-{accent-light}
text-white font-bold text-sm shadow-lg
hover:shadow-xl hover:scale-[1.02] active:scale-95
transition-all
```

### 5.2. Ghost Button
```
px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200
text-slate-700 font-semibold text-sm
transition-colors
```

### 5.3. Icon Button
```
w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80
flex items-center justify-center text-slate-500
hover:bg-slate-100 active:bg-slate-200
transition-colors
```

---

## 6. Layout — Bố Cục Trang

### 6.1. Page Container Pattern
Mọi trang (English/Chinese/Admin) đều follow pattern này:
```tsx
export default function SomePage() {
  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Page Title
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Description text
        </p>
      </div>

      {/* Content sections */}
      <section className="space-y-4">
        {/* ... */}
      </section>
    </div>
  );
}
```

### 6.2. CẤM — KHÔNG BAO GIỜ
- ❌ `<div className="min-h-screen bg-[#0F172A] text-slate-100">` — Tạo web trong web
- ❌ Wrapper div đè nền riêng toàn trang
- ❌ Padding bottom `pb-20` / `pb-24` (layout đã handle)

### 6.3. Grid Layout
```
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4
```

---

## 7. Hero Section — Banner Module

Nếu cần hero banner (như Chinese Dashboard), dùng **card hero** thay vì full-bleed dark section:

```tsx
{/* Hero Banner — Light card variant */}
<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 via-white to-amber-50
  border border-rose-200/60 p-6 sm:p-8">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.06),transparent_50%)]" />
  <div className="relative z-10">
    {/* Content */}
  </div>
</div>
```

---

## 8. Icon & Badge

### 8.1. Icon Container (Feature Cards)
```
h-10 w-10 rounded-xl bg-{color}-50 border border-{color}-200/60
text-{color}-500 flex items-center justify-center
```

### 8.2. Badge / Tag
```
text-[10px] font-bold uppercase tracking-wider
px-2 py-0.5 rounded-md
bg-{color}-50 text-{color}-600 border border-{color}-200
```

---

## 9. Progress Bar

```tsx
<div className="h-2 rounded-full bg-slate-100 overflow-hidden">
  <div
    className="h-full bg-gradient-to-r from-{accent} to-{accent-light} rounded-full transition-all duration-500"
    style={{ width: `${percent}%` }}
  />
</div>
```

---

## 10. Spacing & Responsive

| Breakpoint | Prefix | Viewport |
|------------|--------|----------|
| Mobile | (default) | < 640px |
| Tablet | `sm:` | ≥ 640px |
| Desktop | `lg:` | ≥ 1024px |
| Wide | `xl:` | ≥ 1280px |

### 10.1. Spacing Scale
| Context | Mobile | Desktop |
|---------|--------|---------|
| Page padding | handled by AppLayout | handled by AppLayout |
| Section gap | `space-y-6` | `sm:space-y-8` |
| Card padding | `p-4` | `sm:p-5 lg:p-6` |
| Grid gap | `gap-3` | `gap-4` |

---

## 11. Animation & Transitions

- **Page transitions:** Handled bởi `AppLayout` → `AnimatePresence` + `framer-motion`
- **Hover:** `transition-all duration-200` hoặc `transition-colors`
- **Scale hover:** `hover:scale-[1.02] active:scale-95`
- **KHÔNG** dùng animation nặng tự tạo (keyframes) trừ khi cần thiết

---

## 12. Glassmorphism (Chỉ Dùng Cho Header/Overlay)

```
bg-white/80 backdrop-blur-xl border-b border-slate-200/60
```
- **CHỈ** dùng cho: Header, Modal overlay, Dropdown
- **KHÔNG** dùng cho card thông thường trên nền `surface-base`

---

## 13. Checklist Trước Khi Commit UI

- [ ] Trang có dùng `bg-[#0F172A]` hoặc dark background không? → **Xóa**
- [ ] Text có dùng `text-white` / `text-slate-100` trên nền sáng không? → **Đổi sang `text-slate-900`**
- [ ] Card có dùng `bg-slate-900` không? → **Đổi sang `bg-white`**
- [ ] Border có dùng `border-slate-700/800` không? → **Đổi sang `border-slate-200`**
- [ ] Font có đúng Inter không? → **Check**
- [ ] Spacing có tuân theo scale không? → **Check**
- [ ] Trang nhìn liền mạch với phần còn lại không? → **Check**

---

> **Ghi chú:** File này được tạo để giải quyết vấn đề "web đen lồng trong web sáng".
> Mọi thay đổi giao diện trong tương lai phải tuân theo các quy tắc trên.
