# Front-End Design & UI/UX Specification Document

This document serves as a comprehensive visual and behavioral guide for front-end developers to replicate the user interface, design language, and functional structure of the **Haseen Platform (البوابة الوطنية لخدمات الأمن السيبراني)** as captured in the provided reference screenshots.

---

## 1. Design Overview & Theme
The platform features a modern, clean, and highly professional executive design tailored for corporate and governmental cyber security operations. It utilizes a deep corporate blue and emerald green color palette with an asymmetrical, spacious layout that balances imagery with functional service cards.

### Color Palette Reference
* **Primary Dark Blue / Hero Background:** `#123962` to `#0B2545` (Gradient / Deep overlay)
* **Primary Emerald Green (Accents & Primary Buttons):** `#1E824C` / `#1B7F4B`
* **Background White / Off-White:** `#FFFFFF` / `#F8F9FA`
* **Text / Dark Typography:** `#1A1A1A` / `#222222`
* **Muted Text / Form Labels:** `#6C757D` / `#555555`
* **Card Accent Badge (Light Orange/Gold):** `#FFF4E5` background with `#D97706` text (for "Soon / قريباً" status tags).

### Typography & Language Direction
* **Direction:** Right-to-Left (RTL) default, with a localized English layout switchable via the top navigation bar.
* **Font Family Suggestion:** High-quality Arabic sans-serif fonts such as **Cairo**, **IBM Plex Sans Arabic**, or **Tajawal** to ensure clean, readable corporate styling.

---

## 2. Global Elements & Layout Structure

### A. Top Header & Navigation Bar
The header is clean, white, and strictly aligned to support seamless RTL navigation.

1.  **Top Alert / Utility Strip (Right side):**
    * Text: "موقع حكومي مسجل لدى هيئة الحكومة الرقمية" (Registered government website with the Digital Government Authority) accompanied by a green flag icon/badge.
    * Verification Link: "كيف تتحقق" (How to verify).
2.  **Language Switcher & Navigation Controls (Center/Left top):**
    * A pill-shaped or tabbed toggler containing **Arabic** (Active) and **English**.
    * Utility icons for accessibility, browser adjustments, and menu dropdown options.
3.  **Main Navigation Links (Right aligned):**
    * **Logo/Branding:** "حصين Haseen" accompanied by an abstract, geometric cyber security shield/network icon.
    * **الصفحة الرئيسية** (Home Page) – *Highlighted/Active with a solid green block background and white text.*
    * **خدمات الجهات** (Entity Services)
    * **خدمات الأفراد** (Individual Services)
4.  **Action Elements (Left aligned):**
    * **مركز المساعدة** (Help Center) accompanied by a lightbulb/support icon.
    * **تسجيل الدخول** (Login) accompanied by an exit/entry door icon.
    * **Search Icon:** Simple magnifying glass icon for platform-wide search.

---

## 3. Section Breakdown & Components

### Component 1: Hero Banner (Main Interface)
* **Background:** A full-width dark blue banner showcasing an high-technology office backdrop overlaid with a professional cybersecurity operator working on multiple command-center screens.
* **Main Header Text (H1):** * `البوابة الوطنية لخدمات الأمن السيبراني` (National Portal for Cyber Security Services)
    * Styling: White, bold, extra-large font, prominent vertical tracking.
* **Sub-headline Text:**
    * `فضاء سيبراني سعودي آمن وموثوق يمكّن النمو والازدهار` (A secure and trusted Saudi cyberspace that enables growth and prosperity)
    * Styling: White, regular font, medium weight.
* **Call to Action (CTA) Button:**
    * Text: `الوصول للبوابة` (Access the Portal)
    * Styling: Rectangular white button, dark blue text, sharp or slightly rounded corners (`border-radius: 4px`), transitions to a subtle opacity or light grey on hover.
* **Sticky Floating Element (Bottom Left of Hero):**
    * A pill-shaped button: `قيم تجربتك` (Rate your experience) featuring an interactive feedback dial icon. Dark charcoal background with white text.

### Component 2: Service Showcase Tabbed Section ("أبرز الخدمات")
A clean white content block positioned directly below the hero banner with a card grid format.

1.  **Section Title:** `أبرز الخدمات` (Featured Services) on the right, balanced by a `عرض الكل` (View All) clear text button on the left.
2.  **Audience Filter Tabs:**
    * `خدمات الجهات` (Entity Services) - *Active state characterized by a solid green bottom border indicator.*
    * `خدمات الأفراد` (Individual Services) - *Inactive gray state.*
3.  **Service Category Sub-Tabs:**
    A horizontal scrollable or wrapped secondary list of tag filters:
    * `الأكاديمية الوطنية للأمن السيبراني` (National Cyber Security Academy) - *Active/Selected with a dark background and white text.*
    * `التوعية السيبرانية` (Cyber Awareness)
    * `فحص الملفات والروابط` (File and Link Scanning)
    * `مرصد الكوادر السيبرانية` (Cyber Cadres Observatory)
    * `توثيق البريد الإلكتروني` (Email Authentication)

4.  **Service Description Cards Grid:**
    Cards should be rendered side-by-side using an equal-width grid column configuration.
    * **Card 1 Title:** `خدمة التسجيل في التمارين السيبرانية` (Registration Service for Cyber Exercises)
    * **Card 2 Title:** `خدمة التسجيل في البرامج التدريبية للجهات` (Registration Service in Training Programs for Entities)
    * **Card Design Details:**
        * White background, rounded corners (`border-radius: 12px`), delicate light grey outer border or subtle drop shadow.
        * Top Category Badge: Light green font container with the category label `الأكاديمية الوطنية للأمن السيبراني`.
        * Description Text: Truncated multi-line layout finishing with an ellipsis (`...`).
        * Status Tag (Bottom Right): A rounded pill tag reading `قريباً` (Soon) using the light gold/orange warning palette.

### Component 3: Helpdesk / Support Banner ("بكم نهتم")
A full-width, low-profile box container positioned towards the footer area.

* **Card Wrapper:** Clean white background with a very thin gray container line and curved borders.
* **Icon Asset (Top Right):** A minimalist green circle containing a modern headset support icon.
* **Heading:** `بكم نهتم` (We care about you) in a prominent dark font weight.
* **Sub-text:** `خدمة مخصصة لتقديم الدعم والمساعدة لكم على مدار الساعة` (A dedicated service to provide support and assistance to you around the clock).
* **Action Button (Bottom Left):**
    * Text: `ابدأ` (Start) followed by a leftward tracking arrow (`←`).
    * Styling: Solid emerald green block background, crisp white text/arrow asset, slightly rounded corners.

---

## 4. UI/UX Interaction Notes & Accessibility
* **Sticky Floating Widgets:** * The `قيم تجربتك` (Rate your experience) widget should remain anchored to the bottom-left viewport margin.
    * An accessibility widget shortcut (green circular button displaying a person icon) must remain anchored to the bottom-right corner across all viewports to provide text-to-speech, contrast variations, and font scaling options.
* **Hover States:** All interactive navigation elements, buttons (`الوصول للبوابة`, `ابدأ`, `عرض الكل`), and service cards should possess smooth CSS transitions (`transition: all 0.3s ease`) that adjust brightness or introduce a soft depth shadow on hover.
* **Responsive Adaptation:** Ensure the top menu fluidly wraps into a hamburger configuration on smaller viewing viewports, and the side-by-side service cards stack vertically into a single column format while maintaining internal alignment rules.
