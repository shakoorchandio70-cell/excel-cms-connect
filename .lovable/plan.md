

# AI Companion — FAB + Chat Panel

## Overview
Build a floating AI assistant with a branded FAB (matching the CATI logo style) and an inviting tooltip bubble saying "Need Help?" to make it immediately recognizable as an AI helper.

## FAB Design
- **Position**: Fixed bottom-right (right-24px, bottom-24px)
- **Shape**: 52px circle with the CATI hexagon SVG mark (same as sidebar logo) but with a small sparkle/bot overlay in the corner to signal "AI"
- **Color**: `#00D4FF` fill on `#12161F` background, matching brand
- **Tooltip bubble**: A small pill floating above/left of the FAB: "Need Help?" in `#F1F5F9` text on `#1A202E` background with a subtle `#1E2535` border. Auto-shows on first load, dismissible, reappears on hover. Includes a tiny "AI" badge in cyan

## Chat Panel
- **Size**: 380px wide, 520px tall, fixed bottom-right
- **Header**: "AI Assistant" with sparkle icon + close button, `#0C1018` background
- **Messages**: User bubbles `rgba(0,212,255,0.12)`, assistant bubbles `#1A202E`
- **Input**: `#12161F` bg, cyan focus ring, send button in `#00D4FF`
- **Markdown**: Render AI responses with `react-markdown`

## Edge Function: `supabase/functions/ai-companion/index.ts`
- Accept `{ messages, role }` — role is "admin", "technician", or "official"
- Build role-specific system prompt with complaint management guidance, dos/don'ts
- Stream response from Lovable AI Gateway (`google/gemini-3-flash-preview`)
- Use `LOVABLE_API_KEY` from environment

## Files to Create/Edit
1. **Create** `src/components/AIChatFAB.tsx` — FAB button + tooltip bubble + chat panel
2. **Create** `supabase/functions/ai-companion/index.ts` — edge function with role-aware prompts
3. **Edit** `src/components/AppLayout.tsx` — render `<AIChatFAB />` passing role info
4. **Install** `react-markdown` for response rendering

## Build Order
1. Create edge function with streaming + role-based system prompts
2. Create AIChatFAB component with FAB, "Need Help?" bubble, and chat panel
3. Wire into AppLayout with role from `useUserRole`

