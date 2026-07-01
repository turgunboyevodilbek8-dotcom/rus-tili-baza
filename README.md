# 🇷🇺 Baza: Rus Tili

O'zbeklar uchun rus tili o'rganish dasturi — Telegram Mini App + admin panel + Supabase backend.

## Xususiyatlari

- **25 ta dars** ("Noldan boshlash" bosqichi bilan) — mutlaq boshlang'ich uchun
- **Yozib javob berish**, grammatika tushuntirishi, **So'zlarim** (o'rganilgan so'zlar)
- **Haqiqiy Reyting** — endi backend orqali barcha foydalanuvchilarning XP'lari solishtiriladi (Telegram orqali kirilganda). Telegramsiz ochilsa, demo taqqoslash ko'rsatiladi.
- **Kunlik streak**, XP tizimi
- **To'liq Admin panel** (`/admin.html`) — foydalanuvchilarni ko'rish/bloklash/XP o'zgartirish, darslarni qo'shish/tahrirlash/o'chirish, so'zlar statistikasi
- **Vibrant Russian Academy** dizayn tizimi

## Arxitektura

```
index.html.html   → asosiy ilova (Telegram Mini App)
admin.html        → parol bilan himoyalangan admin panel
/api/*.js         → Vercel Serverless Functions (backend)
schema.sql        → Supabase (Postgres) jadval sxemasi + boshlang'ich darslar
```

Ilova endi ikki rejimda ishlaydi:
- **Telegram ichida ochilganda** → Telegram orqali sizni haqiqiy foydalanuvchi sifatida taniydi, progress serverga saqlanadi, admin sizni ko'ra oladi/boshqara oladi.
- **Oddiy brauzerda ochilganda** (masalan test qilish uchun) → faqat `localStorage`da ishlaydi, hech narsa serverga yubormaydi (chunki Telegram identifikatsiyasi yo'q).

## O'rnatish — qadam-baqadam

### 1. Supabase loyihasini yarating
1. supabase.com → New Project
2. Project yaratilgach, **SQL Editor** → New query → `schema.sql` faylining butun mazmunini joylashtiring → Run
3. **Project Settings → API** dan quyidagilarni oling:
   - `Project URL` → bu `SUPABASE_URL`
   - `service_role` kaliti (diqqat: `anon` emas, `service_role`!) → bu `SUPABASE_SERVICE_ROLE_KEY`

### 2. Telegram Bot Token
Sizda allaqachon bor — bu `TELEGRAM_BOT_TOKEN`.

### 3. Admin parol va sessiya kaliti o'ylab toping
- `ADMIN_PASSWORD` — admin panelga kirish paroli (o'zingiz tanlang, kuchli parol tavsiya etiladi)
- `ADMIN_SESSION_SECRET` — tasodifiy uzun satr (masalan 32+ belgidan iborat), sessiya cookie imzolash uchun

### 4. Vercel'da environment variables qo'shing
Vercel loyihangiz → Settings → Environment Variables:

| Nomi | Qiymati |
|---|---|
| `SUPABASE_URL` | Supabase'dan olingan Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase'dan olingan service_role kaliti |
| `TELEGRAM_BOT_TOKEN` | Sizning bot tokeningiz |
| `ADMIN_PASSWORD` | Admin panel paroli |
| `ADMIN_SESSION_SECRET` | Tasodifiy maxfiy satr |

O'zgaruvchilarni qo'shgach, loyihani qayta deploy qiling (Redeploy) — muhim, aks holda eski deploy env var'larni ko'rmaydi.

### 5. Fayllarni GitHub'ga joylashtiring
Ushbu fayllarni repo tuzilishiga mos qo'ying:
```
index.html.html
admin.html
package.json
vercel.json
api/user.js
api/progress.js
api/lessons.js
api/leaderboard.js
api/_lib/supabase.js
api/_lib/telegram.js
api/_lib/adminAuth.js
api/admin/login.js
api/admin/logout.js
api/admin/users.js
api/admin/lessons.js
api/admin/words.js
```
Commit → push → Vercel avtomatik deploy qiladi.

### 6. Admin panelga kiring
`https://sizning-domeningiz.vercel.app/admin.html` ga o'ting, `ADMIN_PASSWORD`ni kiriting.

## Admin panelda nima qila olasiz

- **Boshqaruv paneli**: umumiy statistika (jami/faol/bloklangan foydalanuvchilar, jami darslar, top 5)
- **Foydalanuvchilar**: XP va streak'ni to'g'ridan-to'g'ri tahrirlash, bloklash/blokdan chiqarish, butunlay o'chirish
- **Darslar**: yangi dars qo'shish, mavjudini tahrirlash (JSON formatida so'zlar bilan), o'chirish — o'zgarishlar barcha foydalanuvchilarga darhol ko'rinadi
- **So'zlar statistikasi**: barcha foydalanuvchilar bo'yicha qaysi so'zlar eng qiyin (aniqlik % eng past)

## Muhim eslatmalar

- Admin panel hech qanday build qadamisiz ishlaydi (Tailwind CDN orqali) — alohida deploy kerak emas, `admin.html` avtomatik `/admin.html` manzilida ochiladi.
- API route'lar `SUPABASE_SERVICE_ROLE_KEY`dan foydalanadi, bu hech qachon brauzerga chiqmaydi — faqat serverless funksiyalar ichida ishlaydi.
- Jadvallarda Row Level Security yoqilgan va default-deny — ya'ni faqat backend (`service_role` kaliti orqali) ma'lumotlarga kira oladi, browser to'g'ridan-to'g'ri Supabase'ga ulanolmaydi.

## Versiya tarixi

- **v3.0**: haqiqiy backend (Supabase) + admin panel + Telegram foydalanuvchi identifikatsiyasi + haqiqiy reyting
- **v2.0**: dars ID'lari qaytadan tartiblandi (1-25), XP tizimi, demo reyting, "So'zlarim" tuzatildi
