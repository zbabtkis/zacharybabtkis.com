@AGENTS.md

# zacharybabtkis.com

Zack Babtkis's personal consulting site: three niche lead-gen service hubs
(Safari/iOS extension porting, MCP server development, AI-agent enablement)
plus About. Replaces the archived 2014 Jekyll site (zbabtkis/zigzackattack.github.io).

## Source of truth
- Plan: ~/.claude/workstreams/streams/freelance-leadgen/plan-site-and-inbound-system.md
- BINDING shared stack contract (check before ANY tool/service decision):
  ~/.claude/workstreams/shared/freelance-inbound-stack.md
- Sibling workstream to stay in sync with: ~/.claude/workstreams/streams/contract-pipeline/

## Stack & deploy
- Next.js (App Router) static export (`output: 'export'`) → `out/`
- Deploy target: Cloudflare Pages (DNS for zacharybabtkis.com already on Cloudflare)
- Contact form posts to a separate Cloudflare Worker (see shared contract)
- Analytics: PostHog; every page tagged for lead attribution (`source_page`)

## Copy rules
- All experience claims must be commit-backed / verifiable (attribution rigor)
- No jargon for external audiences; numbers first (2M+ users, 30,000+ retailers, acquired by PayPal)
- Bio framing: independent consultant, ex-Honey/PayPal (Senior Staff), ex-Pie/ZeroClick
- Launch audit prices: Safari $2,500 · MCP $2,000 · Agent-readiness $3,000 (credited toward follow-on project)
- Every page: message-match H1, symptom checklist, proof bar, priced entry offer,
  process section, FAQ, single primary CTA (Cal.com fit call) + 3-field form fallback
