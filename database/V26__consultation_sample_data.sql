-- =============================================================================
-- V26 — Consultation sample data for demo
-- Paper   : India Position Paper — MARPOL Annex VI Amendments
-- Paper ID: 00000000-0000-0000-0000-000000000501  (core.papers)
-- Doc ID  : 00000000-0000-0000-0000-000000000201  (documents.documents)
-- Consult : c0000000-0000-0000-0000-000000000001  (documents.consultations)
--
-- Scenario for Clip 5 demo:
--   MoEFCC      → FEEDBACK_SUBMITTED  (2 days ago)   ← moefcc-rep logs in live
--   MEA         → FEEDBACK_SUBMITTED  (1 day ago)
--   MoD         → VIEWED              (today)         ← seen but not responded
--   MoS         → PENDING             (not yet opened)
--   MoPNG       → PENDING             (not yet opened)
--
-- Run:
--   PGPASSWORD=isep_dev_password psql -h localhost -p 5433 \
--     -U isep_app -d isep -f V26__consultation_sample_data.sql
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Update consultation deadline to give it breathing room past today
-- -----------------------------------------------------------------------------
UPDATE documents.consultations
SET
    deadline    = CURRENT_DATE + INTERVAL '4 days',
    sent_at     = NOW() - INTERVAL '3 days',
    notes       = 'Please review India''s draft position on MARPOL Annex VI '
               || 'amendments (GHG emission reduction targets) and provide '
               || 'inter-ministerial feedback by the deadline. This position '
               || 'will be tabled at MSC 108, London, 19 April 2026.',
    status      = 'OPEN'
WHERE id = 'c0000000-0000-0000-0000-000000000001';

-- -----------------------------------------------------------------------------
-- 2. MoEFCC — FEEDBACK_SUBMITTED (2 days ago)
--    Substantive technical feedback — supports India's position with caveats
-- -----------------------------------------------------------------------------
UPDATE documents.consultation_agencies
SET
    status                = 'FEEDBACK_SUBMITTED',
    feedback_submitted_at = NOW() - INTERVAL '2 days',
    feedback_html         =
'<div style="font-family:sans-serif;font-size:14px;line-height:1.7;color:#1a1a1a">
  <p><strong>Ministry of Environment, Forest &amp; Climate Change</strong><br/>
  Inter-Ministerial Consultation Response — MARPOL Annex VI GHG Amendments<br/>
  <em>Submitted: ' || TO_CHAR(NOW() - INTERVAL '2 days', 'DD Mon YYYY, HH24:MI') || ' IST</em></p>
  <hr/>
  <p><strong>Overall Position:</strong> MoEF&amp;CC <strong>supports</strong> India''s
  draft position with the following observations and recommended additions.</p>
  <ol>
    <li>
      <p><strong>Consistency with NDC Commitments (Para 3.2)</strong><br/>
      India''s Nationally Determined Contributions (NDCs) under the Paris Agreement
      commit to reducing emissions intensity of GDP by 45% by 2030. The proposed IMO
      GHG reduction targets for international shipping should be framed as consistent
      with — and complementary to — this commitment. We recommend adding the following
      language to Para 3.2:</p>
      <blockquote style="border-left:3px solid #0066cc;padding-left:12px;color:#333;margin:8px 0">
        <em>"India''s position is informed by its national climate commitments under the
        Paris Agreement and seeks a balanced approach that supports decarbonisation
        while protecting the developmental interests of emerging economies."</em>
      </blockquote>
    </li>
    <li>
      <p><strong>Technology Transfer Provisions (Para 4.1)</strong><br/>
      MoEF&amp;CC strongly endorses the inclusion of explicit technology transfer
      and capacity building provisions. Developed nations must not place the burden
      of transition costs solely on developing flag states. The draft should reference
      the IMO''s Technical Cooperation Fund and call for enhanced contributions.</p>
    </li>
    <li>
      <p><strong>Alternative Fuels Neutrality (Para 5)</strong><br/>
      We recommend India adopt a technology-neutral stance on alternative fuels
      (LNG, methanol, ammonia, hydrogen). Prescribing specific fuels at this stage
      risks locking India into dependencies that may not align with its domestic
      energy mix. The position should call for a fuel-neutral framework with
      lifecycle emissions accounting.</p>
    </li>
  </ol>
  <p><strong>Recommended action:</strong> Incorporate the above three points before
  finalising India''s submission. MoEF&amp;CC is available for a pre-MSC 108
  coordination call if required.</p>
  <p style="color:#555;font-size:13px">Reviewed by: Joint Secretary (Climate Change),
  MoEF&amp;CC &nbsp;|&nbsp; Reference: MoEFCC/IC/IMO/2026/114</p>
</div>'
WHERE consultation_id = 'c0000000-0000-0000-0000-000000000001'
  AND agency_user_id  = 'a1000000-0000-0000-0000-000000000001';

-- -----------------------------------------------------------------------------
-- 3. MEA — FEEDBACK_SUBMITTED (1 day ago)
--    Diplomatic / geopolitical framing feedback
-- -----------------------------------------------------------------------------
UPDATE documents.consultation_agencies
SET
    status                = 'FEEDBACK_SUBMITTED',
    feedback_submitted_at = NOW() - INTERVAL '1 day',
    feedback_html         =
'<div style="font-family:sans-serif;font-size:14px;line-height:1.7;color:#1a1a1a">
  <p><strong>Ministry of External Affairs</strong><br/>
  Inter-Ministerial Consultation Response — MARPOL Annex VI GHG Amendments<br/>
  <em>Submitted: ' || TO_CHAR(NOW() - INTERVAL '1 day', 'DD Mon YYYY, HH24:MI') || ' IST</em></p>
  <hr/>
  <p><strong>Overall Position:</strong> MEA <strong>concurs</strong> with the
  draft position and offers the following diplomatic framing recommendations.</p>
  <ol>
    <li>
      <p><strong>Coalition Coordination (General)</strong><br/>
      India should coordinate this position with the IORA (Indian Ocean Rim
      Association) member states and the BASIC group (Brazil, South Africa, China)
      before MSC 108. A coordinated bloc position will carry significantly more
      weight than India''s individual submission. MEA can facilitate preliminary
      consultations through our respective missions if DGS confirms the position
      by 14 April 2026.</p>
    </li>
    <li>
      <p><strong>Language on "Common but Differentiated Responsibilities" (Para 2)</strong><br/>
      The principle of CBDR-RC (Common but Differentiated Responsibilities and
      Respective Capabilities) should be explicitly invoked in the position paper.
      This language has established legal standing under the UNFCCC and will
      resonate with G77 member states at IMO. Recommended addition to Para 2:</p>
      <blockquote style="border-left:3px solid #c8a000;padding-left:12px;color:#333;margin:8px 0">
        <em>"India reaffirms the principle of common but differentiated responsibilities
        in the context of international shipping''s contribution to global
        decarbonisation efforts."</em>
      </blockquote>
    </li>
    <li>
      <p><strong>Bilateral Sensitivities</strong><br/>
      MEA notes that the proposed intermediate targets may create friction with
      certain flag-of-convenience states that are bilateral partners. We recommend
      the position avoid singling out specific vessel categories or flag states by
      name. The text in Para 4.3 should be generalised accordingly.</p>
    </li>
  </ol>
  <p><strong>Recommended action:</strong> Accept MEA recommendations on CBDR
  language and coalition coordination. MEA to brief DGS delegation before
  departure for London.</p>
  <p style="color:#555;font-size:13px">Reviewed by: Joint Secretary (IO-I Division),
  MEA &nbsp;|&nbsp; Reference: MEA/IO/IMO/MSC108/2026/09</p>
</div>'
WHERE consultation_id = 'c0000000-0000-0000-0000-000000000001'
  AND agency_user_id  = 'a1000000-0000-0000-0000-000000000002';

-- -----------------------------------------------------------------------------
-- 4. MoD — VIEWED (opened today, no feedback yet)
-- -----------------------------------------------------------------------------
UPDATE documents.consultation_agencies
SET
    status                = 'VIEWED',
    feedback_submitted_at = NULL,
    feedback_html         = NULL
WHERE consultation_id = 'c0000000-0000-0000-0000-000000000001'
  AND agency_user_id  = 'a1000000-0000-0000-0000-000000000003';

-- -----------------------------------------------------------------------------
-- 5. MoS — PENDING (not yet opened)
-- -----------------------------------------------------------------------------
UPDATE documents.consultation_agencies
SET
    status                = 'PENDING',
    feedback_submitted_at = NULL,
    feedback_html         = NULL
WHERE consultation_id = 'c0000000-0000-0000-0000-000000000001'
  AND agency_user_id  = 'a1000000-0000-0000-0000-000000000004';

-- -----------------------------------------------------------------------------
-- 6. MoPNG — PENDING (not yet opened)
-- -----------------------------------------------------------------------------
UPDATE documents.consultation_agencies
SET
    status                = 'PENDING',
    feedback_submitted_at = NULL,
    feedback_html         = NULL
WHERE consultation_id = 'c0000000-0000-0000-0000-000000000001'
  AND agency_user_id  = 'a1000000-0000-0000-0000-000000000005';

-- -----------------------------------------------------------------------------
-- 7. Verify — print final state
-- -----------------------------------------------------------------------------
SELECT
    ca.agency_name,
    ca.status,
    ca.feedback_submitted_at::DATE AS submitted_on,
    CASE WHEN ca.feedback_html IS NOT NULL THEN 'YES' ELSE 'NO' END AS has_feedback,
    c.deadline
FROM documents.consultation_agencies ca
JOIN documents.consultations c ON c.id = ca.consultation_id
WHERE c.id = 'c0000000-0000-0000-0000-000000000001'
ORDER BY
    CASE ca.status
        WHEN 'FEEDBACK_SUBMITTED' THEN 1
        WHEN 'VIEWED'             THEN 2
        WHEN 'PENDING'            THEN 3
    END;

COMMIT;
