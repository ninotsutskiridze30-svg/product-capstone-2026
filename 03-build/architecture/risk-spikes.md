# Risk Spikes — Sprint 1

**Template:** `Lab-7/templates/risk-spikes-template.md`

Two architectural risks were resolved during Sprint 1 by short exploratory work rather than formal measurement spikes. Outcomes are referenced from [system-design.md](system-design.md) and [tech-stack.md](tech-stack.md). Honest scope: these were design decisions reached by reading the relevant SDKs, scanning community evidence, and prototyping the integration — not full benchmark studies. Sprint 2 will repeat the relevant ones with measurement where it matters.

---

## Risk 1: Video transport — mesh WebRTC vs SFU

**Risk:** building the call feature on the wrong video transport would mean throwing away the implementation when we hit ≥3 participants (which is required for group lessons, a Sprint 2 story).

**Question:** does mesh WebRTC scale to a tutor + 1–2 students on consumer hardware in Georgia (typical: mid-tier Windows laptops, mobile-tethered networks)?

**Method:** literature review (WebRTC scaling guidance, comparable platforms' published architectures) plus a brief prototyping pass on a mesh-WebRTC implementation in the call feature. No formal CPU/throughput benchmark was run.

**Conclusion:** the consensus across published material is that mesh becomes unviable at 3+ participants on consumer hardware. Combined with our Sprint 2 plan for group lessons (multi-student LiveKit rooms), the right call was to start on an SFU. Adopted LiveKit Cloud as a managed SFU rather than self-hosting mediasoup (saves the operational cost of running a media server for a solo team).

**Cost implication:** LiveKit minutes are the dominant variable cost per lesson; captured in [../../04-gtm/financials/unit-economics.md](../../04-gtm/financials/unit-economics.md).

---

## Risk 2: Whiteboard sync transport

**Risk:** running the shared whiteboard over a different channel from the video would mean two authorization layers, two failure modes for the user, and unpredictable cross-channel latency skew.

**Question:** can TLDraw's store-snapshot model be sync'd over the LiveKit data channel, rather than adding a Supabase realtime channel for it?

**Method:** implemented the integration against the LiveKit data-channel API. No formal payload-size benchmark was run; the implementation was judged against the qualitative criteria below.

**Conclusion:** using the LiveKit data channel is preferable to adding a Supabase realtime channel for whiteboard sync because (a) it reuses the room and its authorization, (b) it removes a second failure mode the user can experience independently of the video, and (c) it removes operational complexity for a solo team. Trade-off: full session history requires a separate persistence layer if we ever want a "review the whiteboard later" feature — Sprint 2+ concern, recorded here so it isn't forgotten.

---

## Risks identified but not investigated this sprint (Sprint 2 backlog)

- **Notification delivery on iOS Safari.** Web push on iOS Safari has known reliability gaps. Mitigation likely: email channel first, push later.
- **Georgian text rendering on tutor-uploaded PDFs.** Some font subsets are known to render incorrectly in browser preview; needs investigation in the homework grading view.
- **Supabase RLS performance on the `messages` table at scale.** RLS check on every realtime payload is fine at MVP volume; recheck at >10k messages/day.
