--
-- PostgreSQL database dump
--

\restrict aRY0a7NIvvfoRoB71gWQOJPVlbgEDha4uMumvZkF29aagpFxvYZg0ucvDO0kb3q

-- Dumped from database version 15.17
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: audit; Type: SCHEMA; Schema: -; Owner: isep_app
--

CREATE SCHEMA audit;


ALTER SCHEMA audit OWNER TO isep_app;

--
-- Name: collaboration; Type: SCHEMA; Schema: -; Owner: isep_app
--

CREATE SCHEMA collaboration;


ALTER SCHEMA collaboration OWNER TO isep_app;

--
-- Name: core; Type: SCHEMA; Schema: -; Owner: isep_app
--

CREATE SCHEMA core;


ALTER SCHEMA core OWNER TO isep_app;

--
-- Name: correspondence; Type: SCHEMA; Schema: -; Owner: isep_app
--

CREATE SCHEMA correspondence;


ALTER SCHEMA correspondence OWNER TO isep_app;

--
-- Name: documents; Type: SCHEMA; Schema: -; Owner: isep_app
--

CREATE SCHEMA documents;


ALTER SCHEMA documents OWNER TO isep_app;

--
-- Name: notifications; Type: SCHEMA; Schema: -; Owner: isep_app
--

CREATE SCHEMA notifications;


ALTER SCHEMA notifications OWNER TO isep_app;

--
-- Name: workflow; Type: SCHEMA; Schema: -; Owner: isep_app
--

CREATE SCHEMA workflow;


ALTER SCHEMA workflow OWNER TO isep_app;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: audit; Owner: isep_app
--

CREATE TABLE audit.audit_logs (
    audit_id uuid DEFAULT gen_random_uuid() NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    user_email character varying(255),
    session_id character varying(255),
    ip_address character varying(45),
    action_type character varying(100) NOT NULL,
    entity_type character varying(100) NOT NULL,
    entity_id character varying(255),
    description text NOT NULL,
    before_state jsonb,
    after_state jsonb,
    trace_id character varying(100)
);


ALTER TABLE audit.audit_logs OWNER TO isep_app;

--
-- Name: feedback; Type: TABLE; Schema: collaboration; Owner: isep_app
--

CREATE TABLE collaboration.feedback (
    feedback_id uuid DEFAULT gen_random_uuid() NOT NULL,
    agenda_item_id uuid NOT NULL,
    document_id uuid,
    user_id uuid NOT NULL,
    "position" character varying(20),
    comments text,
    suggested_amendments text,
    status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    submitted_at timestamp with time zone,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT feedback_position_check CHECK ((("position")::text = ANY ((ARRAY['SUPPORT'::character varying, 'OBJECT'::character varying, 'NEUTRAL'::character varying, 'ABSTAIN'::character varying])::text[]))),
    CONSTRAINT feedback_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'SUBMITTED'::character varying, 'REVIEWED'::character varying])::text[])))
);


ALTER TABLE collaboration.feedback OWNER TO isep_app;

--
-- Name: agenda_items; Type: TABLE; Schema: core; Owner: isep_app
--

CREATE TABLE core.agenda_items (
    agenda_item_id uuid DEFAULT gen_random_uuid() NOT NULL,
    meeting_id uuid NOT NULL,
    item_number character varying(50),
    title character varying(1000) NOT NULL,
    description text,
    category character varying(50),
    priority character varying(20),
    status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    deadline_for_inputs timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    assigned_coordinator_id uuid,
    CONSTRAINT agenda_items_category_check CHECK (((category)::text = ANY ((ARRAY['DISCUSSION'::character varying, 'DECISION'::character varying, 'INFORMATION'::character varying, 'ANY_OTHER_BUSINESS'::character varying])::text[]))),
    CONSTRAINT agenda_items_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'ACTIVE'::character varying, 'CLOSED'::character varying])::text[])))
);


ALTER TABLE core.agenda_items OWNER TO isep_app;

--
-- Name: international_bodies; Type: TABLE; Schema: core; Owner: isep_app
--

CREATE TABLE core.international_bodies (
    body_id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_body_id uuid,
    name character varying(500) NOT NULL,
    abbreviation character varying(50),
    body_type character varying(50) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT international_bodies_body_type_check CHECK (((body_type)::text = ANY ((ARRAY['ASSEMBLY'::character varying, 'COUNCIL'::character varying, 'COMMITTEE'::character varying, 'SUB_COMMITTEE'::character varying, 'WORKING_GROUP'::character varying, 'CORRESPONDENCE_GROUP'::character varying, 'BILATERAL'::character varying, 'OTHER'::character varying])::text[])))
);


ALTER TABLE core.international_bodies OWNER TO isep_app;

--
-- Name: meeting_correspondence_groups; Type: TABLE; Schema: core; Owner: isep_app
--

CREATE TABLE core.meeting_correspondence_groups (
    meeting_id uuid NOT NULL,
    cg_id uuid NOT NULL
);


ALTER TABLE core.meeting_correspondence_groups OWNER TO isep_app;

--
-- Name: TABLE meeting_correspondence_groups; Type: COMMENT; Schema: core; Owner: isep_app
--

COMMENT ON TABLE core.meeting_correspondence_groups IS 'User-selected correspondence groups for a meeting (body must match).';


--
-- Name: meeting_interventions; Type: TABLE; Schema: core; Owner: isep_app
--

CREATE TABLE core.meeting_interventions (
    intervention_id uuid DEFAULT gen_random_uuid() NOT NULL,
    meeting_id uuid NOT NULL,
    agenda_item_id uuid NOT NULL,
    intervention_text text NOT NULL,
    delivered_by_user_id uuid,
    delivered_by_name character varying(255),
    delivered_at timestamp with time zone DEFAULT now() NOT NULL,
    intervention_type character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT meeting_interventions_intervention_type_check CHECK (((intervention_type)::text = ANY ((ARRAY['SUPPORT'::character varying, 'OPPOSE'::character varying, 'PROPOSE_AMENDMENT'::character varying, 'INFORMATION'::character varying])::text[])))
);


ALTER TABLE core.meeting_interventions OWNER TO isep_app;

--
-- Name: meeting_outcomes; Type: TABLE; Schema: core; Owner: isep_app
--

CREATE TABLE core.meeting_outcomes (
    outcome_id uuid DEFAULT gen_random_uuid() NOT NULL,
    meeting_id uuid NOT NULL,
    agenda_item_id uuid NOT NULL,
    decision text NOT NULL,
    resolution_ref character varying(255),
    next_steps text,
    captured_at timestamp with time zone DEFAULT now() NOT NULL,
    captured_by_user_id uuid
);


ALTER TABLE core.meeting_outcomes OWNER TO isep_app;

--
-- Name: meeting_participants; Type: TABLE; Schema: core; Owner: isep_app
--

CREATE TABLE core.meeting_participants (
    participant_id uuid DEFAULT gen_random_uuid() NOT NULL,
    meeting_id uuid NOT NULL,
    user_id uuid NOT NULL,
    meeting_role character varying(50) NOT NULL,
    assigned_by uuid,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT meeting_participants_meeting_role_check CHECK (((meeting_role)::text = ANY ((ARRAY['DELEGATION_LEADER'::character varying, 'MEMBER'::character varying, 'OBSERVER'::character varying])::text[])))
);


ALTER TABLE core.meeting_participants OWNER TO isep_app;

--
-- Name: meeting_status_history; Type: TABLE; Schema: core; Owner: isep_app
--

CREATE TABLE core.meeting_status_history (
    entry_id uuid DEFAULT gen_random_uuid() NOT NULL,
    meeting_id uuid NOT NULL,
    from_status character varying(20) NOT NULL,
    to_status character varying(20) NOT NULL,
    changed_by uuid,
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    notes text
);


ALTER TABLE core.meeting_status_history OWNER TO isep_app;

--
-- Name: meetings; Type: TABLE; Schema: core; Owner: isep_app
--

CREATE TABLE core.meetings (
    meeting_id uuid DEFAULT gen_random_uuid() NOT NULL,
    body_id uuid NOT NULL,
    session_number character varying(50),
    title character varying(500) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    location character varying(500),
    meeting_type character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'PLANNED'::character varying NOT NULL,
    cancellation_reason text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    CONSTRAINT meetings_dates_check CHECK ((end_date >= start_date)),
    CONSTRAINT meetings_meeting_type_check CHECK (((meeting_type)::text = ANY ((ARRAY['IN_PERSON'::character varying, 'VIRTUAL'::character varying, 'HYBRID'::character varying])::text[]))),
    CONSTRAINT meetings_status_check CHECK (((status)::text = ANY ((ARRAY['PLANNED'::character varying, 'ACTIVE'::character varying, 'CONCLUDED'::character varying, 'ARCHIVED'::character varying, 'CANCELLED'::character varying])::text[])))
);


ALTER TABLE core.meetings OWNER TO isep_app;

--
-- Name: papers; Type: TABLE; Schema: core; Owner: isep_app
--

CREATE TABLE core.papers (
    paper_id uuid NOT NULL,
    meeting_id uuid,
    agenda_item_id uuid,
    title character varying(500),
    status character varying(50) DEFAULT 'DRAFT'::character varying,
    draft_content text,
    draft_version integer DEFAULT 0 NOT NULL,
    draft_saved_at timestamp with time zone,
    draft_last_modified_by uuid,
    created_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL,
    updated_at timestamp with time zone DEFAULT clock_timestamp() NOT NULL
);


ALTER TABLE core.papers OWNER TO isep_app;

--
-- Name: TABLE papers; Type: COMMENT; Schema: core; Owner: isep_app
--

COMMENT ON TABLE core.papers IS 'Formal papers (draft content) for SCR-PAPER-02; one canonical draft per paper.';


--
-- Name: reference_data; Type: TABLE; Schema: core; Owner: isep_app
--

CREATE TABLE core.reference_data (
    category character varying(80) NOT NULL,
    code character varying(80) NOT NULL,
    label character varying(255) NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.reference_data OWNER TO isep_app;

--
-- Name: TABLE reference_data; Type: COMMENT; Schema: core; Owner: isep_app
--

COMMENT ON TABLE core.reference_data IS 'Lookup values for dropdowns; all UI options must be served from this or domain tables (no static data in frontend).';


--
-- Name: tasks; Type: TABLE; Schema: core; Owner: isep_app
--

CREATE TABLE core.tasks (
    task_id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(500) NOT NULL,
    description text,
    agenda_item_id uuid,
    meeting_id uuid,
    document_id uuid,
    assigned_to uuid NOT NULL,
    assigned_by uuid NOT NULL,
    priority character varying(20) DEFAULT 'MEDIUM'::character varying NOT NULL,
    due_date timestamp with time zone,
    status character varying(30) DEFAULT 'CREATED'::character varying NOT NULL,
    closed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tasks_priority_check CHECK (((priority)::text = ANY ((ARRAY['HIGH'::character varying, 'MEDIUM'::character varying, 'LOW'::character varying])::text[]))),
    CONSTRAINT tasks_status_check CHECK (((status)::text = ANY ((ARRAY['CREATED'::character varying, 'ASSIGNED'::character varying, 'IN_PROGRESS'::character varying, 'SUBMITTED'::character varying, 'REVIEWED'::character varying, 'CLOSED'::character varying])::text[])))
);


ALTER TABLE core.tasks OWNER TO isep_app;

--
-- Name: user_body_assignments; Type: TABLE; Schema: core; Owner: isep_app
--

CREATE TABLE core.user_body_assignments (
    user_id uuid NOT NULL,
    body_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE core.user_body_assignments OWNER TO isep_app;

--
-- Name: TABLE user_body_assignments; Type: COMMENT; Schema: core; Owner: isep_app
--

COMMENT ON TABLE core.user_body_assignments IS 'User assignments to committees (international bodies) for admin UI.';


--
-- Name: users; Type: TABLE; Schema: core; Owner: isep_app
--

CREATE TABLE core.users (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    keycloak_id character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    designation character varying(255),
    organization character varying(255),
    phone character varying(20),
    system_role character varying(50) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    mfa_enabled boolean DEFAULT false NOT NULL,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    deleted_at timestamp with time zone,
    CONSTRAINT users_system_role_check CHECK (((system_role)::text = ANY ((ARRAY['SYSTEM_ADMIN'::character varying, 'IC_DIVISION_HEAD'::character varying, 'DELEGATION_LEADER'::character varying, 'COORDINATOR'::character varying, 'MEMBER'::character varying, 'VIEWER'::character varying])::text[])))
);


ALTER TABLE core.users OWNER TO isep_app;

--
-- Name: cg_members; Type: TABLE; Schema: correspondence; Owner: isep_app
--

CREATE TABLE correspondence.cg_members (
    cg_member_id uuid DEFAULT gen_random_uuid() NOT NULL,
    cg_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role character varying(50),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE correspondence.cg_members OWNER TO isep_app;

--
-- Name: correspondence_groups; Type: TABLE; Schema: correspondence; Owner: isep_app
--

CREATE TABLE correspondence.correspondence_groups (
    cg_id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_body_id uuid NOT NULL,
    name character varying(500) NOT NULL,
    mandate text,
    india_lead_id uuid,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    imso_reference character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT correspondence_groups_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'CONCLUDED'::character varying])::text[])))
);


ALTER TABLE correspondence.correspondence_groups OWNER TO isep_app;

--
-- Name: document_versions; Type: TABLE; Schema: documents; Owner: isep_app
--

CREATE TABLE documents.document_versions (
    version_id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_id uuid NOT NULL,
    version_number integer NOT NULL,
    minio_object_key character varying(1000) NOT NULL,
    uploaded_by uuid NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    change_summary text,
    file_size_bytes bigint NOT NULL,
    checksum_sha256 character(64) NOT NULL
);


ALTER TABLE documents.document_versions OWNER TO isep_app;

--
-- Name: documents; Type: TABLE; Schema: documents; Owner: isep_app
--

CREATE TABLE documents.documents (
    document_id uuid DEFAULT gen_random_uuid() NOT NULL,
    meeting_id uuid,
    agenda_item_id uuid,
    body_id uuid,
    document_type character varying(50) NOT NULL,
    title character varying(1000) NOT NULL,
    source character varying(50) NOT NULL,
    minio_bucket character varying(255) NOT NULL,
    minio_object_key character varying(1000) NOT NULL,
    file_name character varying(500) NOT NULL,
    file_size_bytes bigint NOT NULL,
    mime_type character varying(100) NOT NULL,
    checksum_sha256 character(64) NOT NULL,
    current_version integer DEFAULT 1 NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying NOT NULL,
    is_downloadable boolean DEFAULT true NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    uploaded_by uuid NOT NULL,
    uploaded_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT documents_document_type_check CHECK (((document_type)::text = ANY ((ARRAY['AGENDA_PAPER'::character varying, 'WORKING_DOCUMENT'::character varying, 'SUBMISSION'::character varying, 'REFERENCE'::character varying, 'INTERVENTION'::character varying, 'MINUTES'::character varying, 'COUNTRY_POSITION'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT documents_source_check CHECK (((source)::text = ANY ((ARRAY['INDIA'::character varying, 'IMO_SECRETARIAT'::character varying, 'OTHER_MEMBER_STATE'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT documents_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'SUPERSEDED'::character varying, 'ARCHIVED'::character varying, 'LOCKED'::character varying])::text[])))
);


ALTER TABLE documents.documents OWNER TO isep_app;

--
-- Name: notifications; Type: TABLE; Schema: notifications; Owner: isep_app
--

CREATE TABLE notifications.notifications (
    notification_id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipient_user_id uuid NOT NULL,
    notification_type character varying(100) NOT NULL,
    title character varying(500),
    message text,
    linked_entity_type character varying(100),
    linked_entity_id character varying(255),
    is_read boolean DEFAULT false NOT NULL,
    delivered_in_portal_at timestamp with time zone,
    delivered_email_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE notifications.notifications OWNER TO isep_app;

--
-- Name: paper_approval_stages; Type: TABLE; Schema: workflow; Owner: isep_app
--

CREATE TABLE workflow.paper_approval_stages (
    stage_id uuid DEFAULT gen_random_uuid() NOT NULL,
    paper_id uuid NOT NULL,
    stage_number integer NOT NULL,
    stage_name character varying(100) NOT NULL,
    approver_user_id uuid,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    acted_at timestamp with time zone,
    comments text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT paper_approval_stages_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'RETURNED'::character varying])::text[])))
);


ALTER TABLE workflow.paper_approval_stages OWNER TO isep_app;

--
-- Name: TABLE paper_approval_stages; Type: COMMENT; Schema: workflow; Owner: isep_app
--

COMMENT ON TABLE workflow.paper_approval_stages IS 'Approval pipeline stages per paper (ACT-B07).';


--
-- Name: workflow_instances; Type: TABLE; Schema: workflow; Owner: isep_app
--

CREATE TABLE workflow.workflow_instances (
    workflow_id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_id uuid,
    workflow_type character varying(50) NOT NULL,
    current_state character varying(100) NOT NULL,
    previous_state character varying(100),
    initiated_by uuid,
    initiated_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    deadline timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT workflow_instances_workflow_type_check CHECK (((workflow_type)::text = ANY ((ARRAY['PAPER_APPROVAL'::character varying, 'FEEDBACK_CONSOLIDATION'::character varying, 'TASK_COMPLETION'::character varying])::text[])))
);


ALTER TABLE workflow.workflow_instances OWNER TO isep_app;

--
-- Name: workflow_transition_logs; Type: TABLE; Schema: workflow; Owner: isep_app
--

CREATE TABLE workflow.workflow_transition_logs (
    transition_id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_id uuid NOT NULL,
    from_state character varying(100) NOT NULL,
    to_state character varying(100) NOT NULL,
    triggered_by uuid,
    trigger_action character varying(50) NOT NULL,
    comments text,
    transitioned_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT workflow_transition_logs_trigger_action_check CHECK (((trigger_action)::text = ANY ((ARRAY['APPROVE'::character varying, 'REJECT'::character varying, 'ESCALATE'::character varying, 'SYSTEM'::character varying])::text[])))
);


ALTER TABLE workflow.workflow_transition_logs OWNER TO isep_app;

--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: audit; Owner: isep_app
--

COPY audit.audit_logs (audit_id, "timestamp", user_id, user_email, session_id, ip_address, action_type, entity_type, entity_id, description, before_state, after_state, trace_id) FROM stdin;
f37f7a66-75ab-497e-9da9-a77b7432b4cf	2026-03-11 11:54:27.633831+00	1664255c-610e-4ac2-b603-7a8068f57b72	admin-sa@isep.local	\N	\N	LOGIN	USER	\N	User logged in	\N	\N	\N
8f2744e8-34d8-481c-870d-04e8bd2a70ac	2026-03-11 11:54:27.712757+00	1664255c-610e-4ac2-b603-7a8068f57b72	admin-sa@isep.local	\N	\N	LOGIN	USER	\N	User logged in	\N	\N	\N
06981507-7418-4bd4-af42-a08aed99ead3	2026-03-11 11:54:36.986539+00	1664255c-610e-4ac2-b603-7a8068f57b72	admin-sa@isep.local	\N	\N	VIEW	AUDIT	\N	Viewed audit log	\N	\N	\N
\.


--
-- Data for Name: feedback; Type: TABLE DATA; Schema: collaboration; Owner: isep_app
--

COPY collaboration.feedback (feedback_id, agenda_item_id, document_id, user_id, "position", comments, suggested_amendments, status, submitted_at, reviewed_by, reviewed_at, created_at, updated_at) FROM stdin;
650ac9a4-b989-417b-b500-a2e1ec7c7853	880ec93e-096d-4d17-b889-89cd4dbddc0a	\N	c1000000-0000-0000-0000-000000000001	NEUTRAL	All relevant document to be circulated asap		SUBMITTED	2026-03-04 09:28:28.619493+00	\N	\N	2026-03-04 09:28:28.583427+00	2026-03-04 09:28:28.621609+00
\.


--
-- Data for Name: agenda_items; Type: TABLE DATA; Schema: core; Owner: isep_app
--

COPY core.agenda_items (agenda_item_id, meeting_id, item_number, title, description, category, priority, status, deadline_for_inputs, created_at, updated_at, assigned_coordinator_id) FROM stdin;
6d71c3c4-1c0a-4682-b34e-273a4d352128	5c97d67f-76f8-464b-9bf5-ae98f5752095	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2026-03-07 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
af91798b-dbe0-45e1-ae13-e55c2c5032d9	5c97d67f-76f8-464b-9bf5-ae98f5752095	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2026-03-07 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
976d4467-2f6e-42c9-b289-746e1480c2d8	5c97d67f-76f8-464b-9bf5-ae98f5752095	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-03-07 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
4a37aa8e-78f5-4eea-ad4b-509918c60ba4	b1000000-0000-0000-0000-00000000003d	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-12-08 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
c0bbf900-2499-4543-991a-48c8a4fc972b	b1000000-0000-0000-0000-00000000003d	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-12-08 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
a6cfd662-f38d-4a7f-81a4-530b1e2e17d8	b1000000-0000-0000-0000-00000000003d	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-12-08 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
483322e6-11b0-4f32-ae69-361b2faa92c6	b1000000-0000-0000-0000-00000000003e	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2026-01-05 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
e4a00505-4cca-4d11-942e-a35711635fb8	b1000000-0000-0000-0000-00000000003e	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2026-01-05 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
b9ec2144-82ff-4258-968e-42487426be50	b1000000-0000-0000-0000-00000000003e	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-01-05 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
7fb1e791-9856-4d80-837f-336fe0d55358	b1000000-0000-0000-0000-00000000003f	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2026-01-12 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
c17370dc-7d56-4e68-a7ab-60c52408f91e	b1000000-0000-0000-0000-00000000003f	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2026-01-12 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
e3604382-d81c-4354-a669-e2910fe5244b	b1000000-0000-0000-0000-00000000003f	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-01-12 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
e9d2520d-39c3-4dc0-ab73-dd95d28c4779	b1000000-0000-0000-0000-000000000040	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2026-01-19 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
1c52b1be-d3b2-4a2a-a3bc-b6cb10a6ffed	b1000000-0000-0000-0000-000000000040	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2026-01-19 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
2a25b791-524d-42ec-9051-6557780f0e48	b1000000-0000-0000-0000-000000000040	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-01-19 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
2b8088fa-5394-46f5-9f75-71e1604a4fe8	b1000000-0000-0000-0000-000000000041	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2026-01-26 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
2a6a9d4d-370f-47f1-b88b-7e25aa774ac1	b1000000-0000-0000-0000-00000000003d	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-12-09 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
3e9cb67a-d80c-4c5c-afb6-6ad47aa82024	b1000000-0000-0000-0000-00000000003d	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-12-11 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
245e1bcb-b67f-4351-b145-dc87c997ef30	b1000000-0000-0000-0000-00000000003d	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-12-13 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
993976fe-592d-4bea-83b8-0fc1284bf429	b1000000-0000-0000-0000-00000000003d	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-12-15 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
438e2a99-cbfe-4536-b60a-108f7108351e	b1000000-0000-0000-0000-00000000003d	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-12-17 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
72223a83-9efb-4eb2-b91b-deafd640e189	b1000000-0000-0000-0000-00000000003e	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2026-01-06 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
a5585a49-1332-4ff0-9953-3b59da3db384	b1000000-0000-0000-0000-00000000003e	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2026-01-08 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
9a91153d-8801-4c80-8adf-d66a03759ad2	b1000000-0000-0000-0000-00000000003e	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-01-10 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
36bf95e2-7d0a-4763-80fc-657b194c603d	b1000000-0000-0000-0000-00000000003e	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2026-01-12 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
09073efc-da3e-4ae8-8e98-da4b360ab1eb	b1000000-0000-0000-0000-00000000003e	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2026-01-14 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
48224927-d538-4d0e-8740-8ccc8d7ef5c2	b1000000-0000-0000-0000-00000000003f	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2026-01-13 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
7f217357-a070-4c72-981d-36c4b96e2381	b1000000-0000-0000-0000-00000000003f	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2026-01-15 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
667dd1d8-8067-4f14-a2d7-d671e335f5fb	b1000000-0000-0000-0000-00000000003f	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-01-17 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
bed5a511-1a25-45f7-93f2-bf5e8325b832	b1000000-0000-0000-0000-00000000003f	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2026-01-19 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
437e40a0-658e-4814-b9da-dd14b3ae5373	b1000000-0000-0000-0000-00000000003f	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2026-01-21 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
1831f734-eb5e-430c-86b8-9982e361785a	b1000000-0000-0000-0000-000000000040	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2026-01-20 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
0c907982-9d51-4094-9562-07bc306f420e	b1000000-0000-0000-0000-000000000043	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2026-02-18 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
dfeb98e9-819a-4b01-8f3b-42f749f0de42	b1000000-0000-0000-0000-000000000040	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2026-01-22 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
83009465-84bd-49a0-91ce-a8f885028dee	b1000000-0000-0000-0000-000000000040	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-01-24 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
651d956a-2bea-4367-88ae-4f413dadaf8c	b1000000-0000-0000-0000-000000000040	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2026-01-26 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
388a3c7e-4af2-4680-9e3b-e9199771e798	b1000000-0000-0000-0000-000000000040	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2026-01-28 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
9de2a87d-baae-45bf-afde-1ae9bb4c783b	b1000000-0000-0000-0000-000000000041	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2026-01-27 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
2513c72f-915b-424b-a01f-86b25e402c3a	b1000000-0000-0000-0000-000000000041	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2026-01-29 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
31a289f3-ffb5-44a5-9337-008981779b1c	b1000000-0000-0000-0000-000000000041	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-01-31 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
2bba29fd-197c-49ac-aeb0-f3ad7702365f	b1000000-0000-0000-0000-000000000041	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2026-02-02 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
0882fd38-4789-4c88-a7bf-62f2945c4d88	b1000000-0000-0000-0000-000000000041	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2026-02-04 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
c47c303d-4904-4501-975a-64a0bf36ee69	b1000000-0000-0000-0000-000000000045	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2026-02-03 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
d3075cf5-98f7-4971-92ad-9b71ff50ec8f	b1000000-0000-0000-0000-000000000045	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2026-02-05 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
dd380ec8-a892-413c-a5c2-c85dac1f2efa	b1000000-0000-0000-0000-000000000045	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-02-07 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
e80795d6-e295-4270-84a5-356d3dfaa0ba	b1000000-0000-0000-0000-000000000045	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2026-02-09 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
e20c9829-c101-4d06-819d-ea7f4a7a39eb	b1000000-0000-0000-0000-000000000045	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2026-02-11 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
f800818b-a2c7-4dc0-afba-d67545412d2a	b1000000-0000-0000-0000-000000000042	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2026-02-03 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
2081939b-d4b5-42a7-ba18-c5bfe0cdd2fb	b1000000-0000-0000-0000-000000000042	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2026-02-05 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
4d69290d-f491-4760-866b-04f75dca9924	b1000000-0000-0000-0000-000000000042	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-02-07 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
713f577c-1710-4ca7-b77b-5ab72499a92b	b1000000-0000-0000-0000-000000000042	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2026-02-09 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
452ed090-8825-4adc-8185-409b805bf8ce	b1000000-0000-0000-0000-000000000042	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2026-02-11 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
567bf4fe-ee03-4b64-ad30-49ade68e6c83	b1000000-0000-0000-0000-000000000046	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2026-02-10 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
37715a81-b450-40af-bb63-81dff03a0ad3	b1000000-0000-0000-0000-000000000046	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2026-02-12 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
2ce70e1f-9e66-4c51-a4d1-415545763743	b1000000-0000-0000-0000-000000000046	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-02-14 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
c411cdf9-d282-4141-b1de-2ae8aff68313	b1000000-0000-0000-0000-000000000046	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2026-02-16 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
8cb8bcc6-95c9-41e0-83c8-c340b89270bf	b1000000-0000-0000-0000-000000000001	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-01-09 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
d40a130d-3f0a-4e32-9aa7-1531999f77c5	b1000000-0000-0000-0000-000000000001	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-01-11 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
772dddfa-9218-4951-b61a-1f7f052598f6	b1000000-0000-0000-0000-000000000001	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-01-13 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
139a46dc-2d2d-4b75-aa36-a505d89c2011	b1000000-0000-0000-0000-000000000001	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-01-15 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a64158f2-0f78-419b-86e1-52de3eb703ec	b1000000-0000-0000-0000-000000000001	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-01-17 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
535b2dce-dd53-4aca-b263-fdf399f6489d	b1000000-0000-0000-0000-000000000002	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-01-16 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
ca6b59c6-5fea-4022-bcea-df503845bea6	b1000000-0000-0000-0000-000000000002	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-01-18 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
f1090796-5e1a-48bf-8c27-841d0065218d	b1000000-0000-0000-0000-000000000002	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-01-20 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
46f8cd0b-c649-4173-a5bb-769dee4d3dc2	b1000000-0000-0000-0000-000000000002	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-01-22 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
828217c8-7fb6-4ca7-8876-d18373295d7e	b1000000-0000-0000-0000-000000000002	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-01-24 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
e504a14b-4ee3-4109-b382-8b66f8bca368	b1000000-0000-0000-0000-000000000003	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-01-30 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
0c212120-a2cd-4efb-98c6-7859e2774c2c	b1000000-0000-0000-0000-000000000003	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-02-01 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
653ad0fb-4ce2-411b-9a94-0b49d66fe682	b1000000-0000-0000-0000-000000000003	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-02-03 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
f6a689a3-2757-40c7-bed8-f58f3ae463a1	b1000000-0000-0000-0000-000000000003	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-02-05 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
44dbba2b-93a3-46fe-adef-d09282567ee2	b1000000-0000-0000-0000-000000000003	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-02-07 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
f4f87d1b-e2b0-449b-8caa-e903d9972230	b1000000-0000-0000-0000-000000000004	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-02-13 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a3b70fc6-d369-4936-8b73-c8def8405660	b1000000-0000-0000-0000-000000000004	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-02-15 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
c6646ec0-fc2e-4dd4-bd39-f790330df75d	b1000000-0000-0000-0000-000000000004	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-02-17 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
2fddccfb-e018-4f6b-946c-31fb1c0d61b4	b1000000-0000-0000-0000-000000000046	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2026-02-18 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
d3da9cfe-068b-4aff-8642-b37d8e447191	b1000000-0000-0000-0000-000000000043	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2026-02-10 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
d5b7db26-1a09-4ce8-bd33-8aa0e14b7e02	b1000000-0000-0000-0000-000000000043	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2026-02-12 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
99c287ca-3efb-45c0-847e-8af8a154831d	b1000000-0000-0000-0000-000000000043	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-02-14 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
970ae2c5-4c95-4fe6-8143-e7bbf4a465ee	b1000000-0000-0000-0000-000000000043	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2026-02-16 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
eb11b98d-b01d-49f8-bd4d-4a14d96ee906	b1000000-0000-0000-0000-000000000044	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2026-02-17 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
b4539200-d567-4b5d-aebf-6c0d0280e72b	b1000000-0000-0000-0000-000000000044	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2026-02-19 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
c3b9fdeb-4c89-4f38-b2d9-3003a49832c9	b1000000-0000-0000-0000-000000000044	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-02-21 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
f64ced92-4918-47ed-8928-0fa014d5d55f	b1000000-0000-0000-0000-000000000044	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2026-02-23 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
592a06c5-3dc8-4322-98e2-d5578c0fcf12	b1000000-0000-0000-0000-000000000044	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2026-02-25 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
f0510bfc-11b0-45eb-a34d-b0cdafb46111	5c97d67f-76f8-464b-9bf5-ae98f5752095	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2026-03-08 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
c42ce1f6-82a5-45de-82d0-d337712ec63a	5c97d67f-76f8-464b-9bf5-ae98f5752095	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2026-03-10 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
fd5f72a7-5acc-4737-b574-f75d23f520e8	5c97d67f-76f8-464b-9bf5-ae98f5752095	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-03-12 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
67764e52-b15d-4b17-aee6-fb7eed49c3ad	5c97d67f-76f8-464b-9bf5-ae98f5752095	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2026-03-14 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
e05502be-9cf9-40b7-a595-5ce3f72abac7	5c97d67f-76f8-464b-9bf5-ae98f5752095	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2026-03-16 17:00:00+00	2026-03-03 10:23:27.199257+00	2026-03-03 10:23:27.199257+00	c1000000-0000-0000-0000-000000000001
739242d6-df38-4158-bc05-03dcf0b8eeb2	b1000000-0000-0000-0000-000000000041	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2026-01-26 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
e3509100-aea7-46e2-9590-3739a71c7791	b1000000-0000-0000-0000-000000000041	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-01-26 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
b087522f-dbe8-4c6c-88c8-d481477d18f5	b1000000-0000-0000-0000-000000000042	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2026-02-02 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
343378c4-a82a-4b67-82c4-a968f94a5016	b1000000-0000-0000-0000-000000000042	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2026-02-02 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
3d539679-123f-45d4-9597-0945dc4d5bbe	b1000000-0000-0000-0000-000000000042	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-02-02 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
95907da3-ca65-499b-9934-ac1b7f8623b8	b1000000-0000-0000-0000-000000000043	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2026-02-09 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
64544cfd-3e3e-486c-8b22-5c0dff1d1933	b1000000-0000-0000-0000-000000000043	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2026-02-09 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
88f66988-fc9a-48bb-a8ad-4bbb77014955	b1000000-0000-0000-0000-000000000043	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-02-09 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
7ccc4fca-a0d1-45dd-9257-68dd84d5f9d9	b1000000-0000-0000-0000-000000000044	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2026-02-16 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
e498bfbc-e1ed-4cee-89d6-b6f84d93defe	b1000000-0000-0000-0000-000000000044	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2026-02-16 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
22d82f39-f018-4c83-acc0-e51d4484c078	b1000000-0000-0000-0000-000000000044	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-02-16 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
da6a4bea-e05d-4f44-868c-61c3a6abf7cc	b1000000-0000-0000-0000-000000000045	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2026-02-02 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
c2e4083a-0a6f-4e68-ac5b-2315c29b9b67	b1000000-0000-0000-0000-000000000045	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2026-02-02 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
7e3e2e2a-88dd-4425-9261-425ffb8e25d5	b1000000-0000-0000-0000-000000000045	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-02-02 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
0173f7c8-9125-4353-835a-032ed577ee2e	b1000000-0000-0000-0000-000000000046	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2026-02-09 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
7c51f3d3-3480-4334-8e4e-886bbb8ccfd9	b1000000-0000-0000-0000-000000000046	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2026-02-09 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
5ce146f3-fa76-41f5-ba7b-43c33ad097be	b1000000-0000-0000-0000-000000000046	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2026-02-09 17:00:00+00	2026-03-03 10:23:27.130005+00	2026-03-03 10:23:27.130005+00	c1000000-0000-0000-0000-000000000001
880ec93e-096d-4d17-b889-89cd4dbddc0a	d862c38d-38e7-4bec-9c65-05cb39dd54c4	1	Opening of the session	Formal opening by the SSE Sub-Committee Chairman. Roll call of Member State delegations. Adoption of the agenda. Assignment of agenda items to working groups. No substantive discussion — procedural only.	INFORMATION	LOW	DRAFT	2026-06-01 23:00:00+00	2026-03-03 18:14:27.922657+00	2026-03-03 18:27:12.079395+00	c1000000-0000-0000-0000-000000000003
cdf9e174-5dce-4fba-94d8-e06bc6cd419e	d862c38d-38e7-4bec-9c65-05cb39dd54c4	4	Fixed CO2 fire-extinguishing systems — Revised guidelines	Finalisation and adoption of revised MSC.1/Circ.1533 guidelines for fixed CO2 fire-extinguishing systems in machinery spaces and cargo pump rooms. The revision addresses: (a) minimum concentration requirements for spaces with high thermal mass, (b) discharge time requirements for deep-sea vessels vs. coastal vessels, and (c) mandatory crew training for CO2 system activation. India has previously raised concerns at SSE 3 about the disproportionate compliance burden on small Indian coastal tankers under the proposed new concentration thresholds. Decision expected at this session.	DISCUSSION	HIGH	DRAFT	2026-09-30 12:01:00+00	2026-03-03 18:17:42.653322+00	2026-03-03 18:17:42.653322+00	c1000000-0000-0000-0000-000000000001
0fced452-2f59-4d79-8c1a-c74db7e0e326	d862c38d-38e7-4bec-9c65-05cb39dd54c4	2	Decisions of other IMO bodies	Report on relevant decisions taken at MSC 108, MEPC 82, and the Council since the previous SSE session. Includes any mandates passed down to SSE for action. India to note any new instructions from MSC affecting fire safety agenda items.	INFORMATION	MEDIUM	DRAFT	2026-07-31 17:30:00+00	2026-03-03 18:15:44.569871+00	2026-03-03 18:27:18.511054+00	c1000000-0000-0000-0000-000000000001
49799b94-83da-488b-8c38-a1fd19126191	d862c38d-38e7-4bec-9c65-05cb39dd54c4	3	Fire protection — Passenger ships	Consideration of proposals to amend SOLAS Chapter II-2 Regulation 10 regarding fire detection and alarm systems on passenger ships with more than 36 passengers. Reviews proposals from Norway, Japan, and the European Commission on mandatory thermal imaging camera systems in main vertical zone corridors. Also addresses sprinkler system reliability standards for ships operating in tropical climates.	DISCUSSION	MEDIUM	DRAFT	2026-08-31 12:00:00+00	2026-03-03 18:16:55.114896+00	2026-03-03 18:16:55.114896+00	c1000000-0000-0000-0000-000000000001
5c426ed6-849a-4ae2-91aa-0e81bc399102	d862c38d-38e7-4bec-9c65-05cb39dd54c4	5	Fire safety measures for ships using alternative fuels	Ongoing development of fire safety requirements for vessels using LNG, methanol, ammonia, and hydrogen as fuel. Session 4 focuses specifically on: (a) fire detection requirements in LNG fuel preparation rooms, (b) ammonia toxicity and fire risk in enclosed machinery spaces, and (c) water-mist system requirements for methanol fuel lines. This item directly intersects with India's national alternative fuel shipping initiative and the proposed LNG bunkering infrastructure at JNPT, Kochi, and Paradip.	DISCUSSION	HIGH	DRAFT	2026-10-30 12:00:00+00	2026-03-03 18:20:29.740815+00	2026-03-03 18:20:29.740815+00	c1000000-0000-0000-0000-000000000001
a39de624-7ea0-4109-a7d0-f4f6bf801568	d862c38d-38e7-4bec-9c65-05cb39dd54c4	6	Maintenance, testing and inspection of fire protection systems	Review of proposed amendments to SOLAS Chapter II-2 Regulation 14 regarding annual testing requirements for portable fire extinguishers, fixed detection systems, and fire dampers. Main debate centres on whether third-party certified service providers should be mandatory for testing, vs. crew-conducted testing with shore-based oversight. India's port State control record on fire system maintenance deficiencies is relevant context.	DISCUSSION	MEDIUM	DRAFT	2026-08-14 12:00:00+00	2026-03-03 18:21:55.873395+00	2026-03-03 18:21:55.873395+00	c1000000-0000-0000-0000-000000000001
5199078c-0f55-4cb6-afb3-fc4dc641cc05	d862c38d-38e7-4bec-9c65-05cb39dd54c4	7	Fire fighting systems on RoRo passenger ferries	Consideration of new mandatory requirements for vehicle deck fire suppression on RoRo passenger ferries following the 2024 Scandinavian RoRo fire incident. Proposals include mandatory fixed water-based fire fighting systems (WBFFS) for all vehicle decks and enhanced CO2 flooding provisions for closed vehicle deck spaces. Decision on whether to mandate WBFFS as a new SOLAS requirement or recommend through MSC circular. India operates 14 RoRo passenger ferry services across major routes including Andaman, Lakshadweep, and the proposed Coastal RoRo corridor.	DECISION	HIGH	DRAFT	2026-09-15 12:00:00+00	2026-03-03 18:22:47.513163+00	2026-03-03 18:22:47.513163+00	c1000000-0000-0000-0000-000000000001
a44a2b95-8074-4053-97b6-ce4c58ef0415	d862c38d-38e7-4bec-9c65-05cb39dd54c4	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2027-02-04 17:00:00+00	2026-03-03 18:25:29.503166+00	2026-03-03 18:25:29.503166+00	c1000000-0000-0000-0000-000000000001
8b4a0e9d-07dd-4dc9-8407-33fc6e54e8be	b1000000-0000-0000-0000-000000000004	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-02-19 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
d6b8edd2-6c8c-4ee4-84fe-2b44b93d63b9	b1000000-0000-0000-0000-000000000004	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-02-21 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a73b4ce1-ff8e-4c4d-a129-a388fa1e1d57	b1000000-0000-0000-0000-000000000005	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-02-20 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
d1fdb4d0-4821-4227-891c-e3fb46ef810a	b1000000-0000-0000-0000-000000000005	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-02-22 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
033ac67a-5f74-4ac2-a336-5fff8cc40ba8	b1000000-0000-0000-0000-000000000005	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-02-24 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
70716998-7452-4046-b4b0-dfe38256efe1	b1000000-0000-0000-0000-000000000005	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-02-26 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
81f89e91-22ab-4ba5-8be7-fb9b771800bc	b1000000-0000-0000-0000-000000000005	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-02-28 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
cc6feff5-f853-4792-bc2e-72088bc60f73	b1000000-0000-0000-0000-000000000006	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-02-27 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
64fb01eb-3dc6-4901-baa3-0702305aa28a	b1000000-0000-0000-0000-000000000006	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-02-29 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
2e521ae8-a64d-45bc-a556-ff301a0eb00b	b1000000-0000-0000-0000-000000000006	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-03-02 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
c011c626-a616-4ead-bf9d-2611eaa1c91a	b1000000-0000-0000-0000-000000000006	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-03-04 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
77006eca-8e9c-44de-8814-b9c6d28e91a4	b1000000-0000-0000-0000-000000000006	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-03-06 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
b84387ad-b019-4e20-80c7-5da016eb7eda	b1000000-0000-0000-0000-000000000007	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-03-05 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
4ea77d9a-da51-40d1-aeae-0a642a01a52a	b1000000-0000-0000-0000-000000000007	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-03-07 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
c97d9dde-d79c-4797-a90f-efea9bd1fc4c	b1000000-0000-0000-0000-000000000007	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-03-09 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
c18d60d5-cdb3-4222-808f-9e939527c932	b1000000-0000-0000-0000-000000000007	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-03-11 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
2f9b8598-a440-486d-a207-aa6a09761b74	b1000000-0000-0000-0000-000000000007	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-03-13 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
2d37603a-6224-4045-81c1-c926fcde7f4f	b1000000-0000-0000-0000-000000000008	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-03-12 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
98e55422-00cf-4d73-adac-136c390bdd93	b1000000-0000-0000-0000-000000000008	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-03-14 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
3b341705-0274-4c47-87c4-14f8ac8cf4ad	b1000000-0000-0000-0000-000000000008	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-03-16 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
ff6e621b-5788-49af-a71e-f9e20316e35e	b1000000-0000-0000-0000-000000000008	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-03-18 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
80f61e52-09d8-4bb1-85e6-c09fada3fd2d	b1000000-0000-0000-0000-000000000008	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-03-20 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
29721aab-15de-42cb-89a8-0c7dd31b1b1f	b1000000-0000-0000-0000-000000000009	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-03-26 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
8a55b120-c78b-45fe-8a81-4962a0149506	b1000000-0000-0000-0000-000000000009	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-03-28 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
d38db452-1537-48da-b8b7-29d0f8cfaf42	b1000000-0000-0000-0000-000000000009	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-03-30 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
05de882e-948c-4474-bf75-3977074b6c76	b1000000-0000-0000-0000-000000000009	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-04-01 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
e9061d55-fd42-421f-90ac-d1e5f57725e3	b1000000-0000-0000-0000-000000000009	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-04-03 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
1cc83d32-996c-4ba2-82d6-9f37c51fe998	b1000000-0000-0000-0000-00000000000a	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-04-02 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
4a3d53c5-dc63-4103-bad2-fa59f34c3d4b	b1000000-0000-0000-0000-00000000000a	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-04-04 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
fac4a483-8711-4963-8ba9-58e75f05122a	b1000000-0000-0000-0000-00000000000a	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-04-06 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a3184391-2e49-4be5-bda4-8b4232696038	b1000000-0000-0000-0000-00000000000a	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-04-08 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
45feb114-39d9-4ae2-8396-f4e1baa368fb	b1000000-0000-0000-0000-00000000000a	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-04-10 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
42051715-6c5f-489b-9f21-36635dffa193	b1000000-0000-0000-0000-00000000000b	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-04-16 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
6185ea61-3d6b-4e0a-b9fd-e425293c9f4b	b1000000-0000-0000-0000-00000000000b	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-04-18 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
52d20b93-8df6-4068-8c86-172610266b35	b1000000-0000-0000-0000-00000000000b	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-04-20 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
3ff53749-982a-4b99-be12-5909e54403d3	b1000000-0000-0000-0000-00000000000b	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-04-22 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
6f19ce28-6fc6-45eb-b95c-eb02f28be4b5	b1000000-0000-0000-0000-00000000000b	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-04-24 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
6d029892-27fc-4520-8f15-1fdfd3e7906e	b1000000-0000-0000-0000-00000000000c	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-05-07 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
57cc1e14-77ad-4a2f-bbc7-4144f18979fe	b1000000-0000-0000-0000-00000000000c	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-05-09 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
64781d6b-98f0-4c6e-87d4-4abebc6a8afe	b1000000-0000-0000-0000-00000000000c	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-05-11 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
ede947e2-401c-4a8d-9cdf-15faa186eb55	b1000000-0000-0000-0000-00000000000c	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-05-13 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
2bb97862-5c93-45f2-b042-fcebcc5089d7	b1000000-0000-0000-0000-00000000000c	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-05-15 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
6e196f17-0f5c-442a-9b3b-23cbbeb7579b	b1000000-0000-0000-0000-00000000000d	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-05-14 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
d9327a1d-69da-4fd3-bc43-71303681881f	b1000000-0000-0000-0000-00000000000d	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-05-16 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
e032c48d-1290-4c89-b002-0c0ac7f18ace	b1000000-0000-0000-0000-00000000000d	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-05-18 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
1d072489-7b73-4f97-8759-725acd151ae4	b1000000-0000-0000-0000-00000000000d	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-05-20 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
5ef0b7a4-4f94-481e-aaff-ca5d67765ec1	b1000000-0000-0000-0000-00000000000d	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-05-22 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
e24d361d-34a8-41ef-b617-66f4cf4ae33e	b1000000-0000-0000-0000-00000000000e	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-05-28 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
43e2f26b-3944-4f14-a464-18e4134dff63	b1000000-0000-0000-0000-00000000000e	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-05-30 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
fa9c23bf-b166-4939-ab63-70177502388f	b1000000-0000-0000-0000-00000000000e	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-06-01 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
fb8d774e-3a5e-46e1-bb17-c35e800007c4	b1000000-0000-0000-0000-00000000000e	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-06-03 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a2bf3c7e-e2b6-478e-aef3-597931196944	b1000000-0000-0000-0000-00000000000e	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-06-05 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
423969b2-3415-4b79-b3bf-6976952c2a87	b1000000-0000-0000-0000-00000000000f	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-06-11 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
afba0f84-1032-4d82-b859-0eb24ba20668	b1000000-0000-0000-0000-00000000000f	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-06-13 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
32e96b64-c7c3-467a-966a-fcc370e056bb	b1000000-0000-0000-0000-00000000000f	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-06-15 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
283bed46-51fc-47aa-8073-36f8ff42b15e	b1000000-0000-0000-0000-00000000000f	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-06-17 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
3cc54765-41c6-4abc-853f-81da6e49261e	b1000000-0000-0000-0000-00000000000f	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-06-19 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
e422731b-e686-4ff0-926d-09f88ca6da4f	b1000000-0000-0000-0000-000000000010	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-06-25 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a55e2a5d-1950-4546-9fee-eca83778f01f	b1000000-0000-0000-0000-000000000010	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-06-27 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a5fe3f8e-4d4a-4bc4-87a0-6957debf5d84	b1000000-0000-0000-0000-000000000010	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-06-29 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
fd0a9ac1-0e13-4d72-b136-eeded87f84cc	b1000000-0000-0000-0000-000000000010	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-07-01 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
8a8c2c60-2c2a-46e0-8d8e-6c0c76beb8f1	b1000000-0000-0000-0000-000000000010	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-07-03 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
63cf4e8f-56a1-4e14-ab3e-6b3610d3c155	b1000000-0000-0000-0000-000000000011	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-07-09 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
e2befdbc-45d8-446f-ab05-b1208c281f33	b1000000-0000-0000-0000-000000000011	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-07-11 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
6ee01551-39c3-4b90-90a1-43dcf50bafa7	b1000000-0000-0000-0000-000000000011	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-07-13 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
1b35794c-0051-4e8f-baec-7c448399248a	b1000000-0000-0000-0000-000000000011	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-07-15 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
2888c0c4-59a3-43fb-8607-1e2dd5d5e649	b1000000-0000-0000-0000-000000000011	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-07-17 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
bf6e6ef0-9e9d-4067-8aa8-d99d97aa9ce5	b1000000-0000-0000-0000-000000000012	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-07-16 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
1088a8a3-5bdd-447f-bd8d-253315a1bc08	b1000000-0000-0000-0000-000000000012	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-07-18 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
1c6032ff-6647-4ea3-a3e9-3667f417cd8d	b1000000-0000-0000-0000-000000000012	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-07-20 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
3f0f5005-fb38-465e-a884-5022e94471d5	b1000000-0000-0000-0000-000000000012	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-07-22 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
3664b944-a5cd-4986-bd46-c083cd6307cf	b1000000-0000-0000-0000-000000000012	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-07-24 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
4ef8bd8e-0a28-4f55-b178-34b911eff634	b1000000-0000-0000-0000-000000000013	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-07-30 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
d7f64ba2-b6c6-4429-81ec-445ee00cba39	b1000000-0000-0000-0000-000000000013	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-08-01 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
c0453de3-fcc9-44e2-9dec-40dc49689264	b1000000-0000-0000-0000-000000000013	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-08-03 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
fc5cb4ad-faaf-46d9-9d32-731e8c059ded	b1000000-0000-0000-0000-000000000013	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-08-05 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
e29c1a2c-fbe5-497f-ade1-5b72dd1c8aad	b1000000-0000-0000-0000-000000000013	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-08-07 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
0ea82c75-b153-4adc-931e-b8930087ce11	b1000000-0000-0000-0000-000000000014	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-08-13 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
c36009a7-efdb-43e1-a9d5-81b4d46ddbe8	b1000000-0000-0000-0000-000000000014	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-08-15 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
32a877e0-896b-4efc-9eaf-67cb67dc888c	b1000000-0000-0000-0000-000000000014	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-08-17 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
92364272-8a64-4255-91db-7d04d8e7a1f5	b1000000-0000-0000-0000-000000000014	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-08-19 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
671b5854-df93-4ec3-b4b2-1c6806789a82	b1000000-0000-0000-0000-000000000014	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-08-21 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
3103b506-3ce5-45d7-98cb-3b5b6490bd65	b1000000-0000-0000-0000-000000000015	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-08-27 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
64073eb6-aa3b-4b79-aadd-574e75b731eb	b1000000-0000-0000-0000-000000000015	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-08-29 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
2c3518e3-fa39-4b17-ba63-7c1b0b72f17f	b1000000-0000-0000-0000-000000000015	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-08-31 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
b75228d7-a11b-45e0-9aa5-eb656d60ba6a	b1000000-0000-0000-0000-000000000015	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-09-02 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
5843ef05-6c21-4076-a971-fa6db3f913bd	b1000000-0000-0000-0000-000000000015	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-09-04 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
b38f5818-0442-458f-a190-27fa91906d7f	b1000000-0000-0000-0000-000000000016	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-09-10 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
1a482dd0-aad3-481c-844c-0621ea608835	b1000000-0000-0000-0000-000000000016	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-09-12 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
df6096a4-e052-4b67-9c97-e8bad1ae2a7d	b1000000-0000-0000-0000-000000000016	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-09-14 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
89e112ff-8561-486e-a05d-a678b7134b83	b1000000-0000-0000-0000-000000000016	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-09-16 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
249db70e-348d-400d-b777-36e9437cc2c4	b1000000-0000-0000-0000-000000000016	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-09-18 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
802f7d99-5272-4159-9942-595eba8e139f	b1000000-0000-0000-0000-000000000017	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-09-17 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
1f4d90d6-423f-4378-8aef-c588f471d922	b1000000-0000-0000-0000-000000000017	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-09-19 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
fd7e5ea1-1605-4abd-8067-ef5db6899401	b1000000-0000-0000-0000-000000000017	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-09-21 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
97407faf-7214-46a4-9ebe-2ce172e484e4	b1000000-0000-0000-0000-000000000017	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-09-23 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
19d77758-8f36-43fe-adfb-94ed1bc5ef8f	b1000000-0000-0000-0000-000000000017	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-09-25 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
108de148-cefd-4ea2-b881-8e0ec18ff349	b1000000-0000-0000-0000-000000000018	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-10-01 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
6465a55a-3b1f-436f-b4a9-5f804556b5a0	b1000000-0000-0000-0000-000000000018	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-10-03 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
e66483a0-f47a-4b6a-8d66-1c90398710c8	b1000000-0000-0000-0000-000000000018	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-10-05 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
f86ae921-7156-461b-9c92-0f2026764f7c	b1000000-0000-0000-0000-000000000018	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-10-07 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
bf9bcdaf-3541-4e52-93b7-a87569dcc56f	b1000000-0000-0000-0000-000000000018	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-10-09 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
dc94be39-4407-431f-b700-0b79fd067d0e	b1000000-0000-0000-0000-000000000019	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-10-15 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
f81f4fed-565b-48de-97e3-0b31629d4ac9	b1000000-0000-0000-0000-000000000019	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-10-17 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
6ca43d1a-eabf-4702-a457-3dd7ba1b07e2	b1000000-0000-0000-0000-000000000019	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-10-19 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
98694d53-d567-45d0-9cd3-88e34dbe8465	b1000000-0000-0000-0000-000000000019	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-10-21 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
633e0c5c-4408-425e-a897-10d551ba8760	b1000000-0000-0000-0000-000000000019	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-10-23 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a381679f-8afb-4061-96c4-fd1a0018eadb	b1000000-0000-0000-0000-00000000001a	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-10-29 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
7bc7bbec-b96c-4563-aaeb-ef706bbd24d6	b1000000-0000-0000-0000-00000000001a	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-10-31 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
05341277-c5d6-4f0c-8225-67577385a0b6	b1000000-0000-0000-0000-00000000001a	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-11-02 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
3b675aba-6214-41ff-ae3e-b1734ce16e3a	b1000000-0000-0000-0000-00000000001a	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-11-04 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
fb4bda45-57ae-4d57-9aa1-543206d44030	b1000000-0000-0000-0000-00000000001a	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-11-06 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
d35e7bd6-c567-494f-8bfb-293cce1d5b15	b1000000-0000-0000-0000-00000000001b	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-11-12 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
04230834-009e-459b-90e8-a85e1a3647ce	b1000000-0000-0000-0000-00000000001b	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-11-14 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
f5f0352e-8049-461f-be59-00ef502e54b3	b1000000-0000-0000-0000-00000000001b	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-11-16 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
7a776a23-307a-431a-bbc2-49b51c1a27bb	b1000000-0000-0000-0000-00000000001b	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-11-18 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
d3067230-0004-42ea-a367-0e0c080ac75a	b1000000-0000-0000-0000-00000000001b	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-11-20 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a8c30ac0-1054-454a-a7a7-ef318ca29c1b	b1000000-0000-0000-0000-00000000001e	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-11-26 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
2d357940-28dd-4f78-8c92-e8c69e15e35d	b1000000-0000-0000-0000-00000000001e	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-11-28 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
8064212c-6527-48d7-a3e9-b7226c0cae91	b1000000-0000-0000-0000-00000000001e	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-11-30 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
72d0301f-d07f-4366-b578-9335d60baa61	b1000000-0000-0000-0000-00000000001e	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-12-02 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
f0ae2d74-0a2a-45fa-892a-b5f7e253d7b2	b1000000-0000-0000-0000-00000000001e	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-12-04 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
573e3206-7a88-4017-ab37-07dc3ddea35c	b1000000-0000-0000-0000-00000000001c	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-12-03 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
1dba6462-2c2d-43ac-81f4-a805fde73415	b1000000-0000-0000-0000-00000000001c	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-12-05 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
57f5e06c-275c-45f6-9055-284f4d1f662f	b1000000-0000-0000-0000-00000000001c	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-12-07 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
fa491080-77d3-4524-8f81-f096cf53016f	b1000000-0000-0000-0000-00000000001c	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-12-09 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a7d8040d-8345-41a7-a7cf-762da575485a	b1000000-0000-0000-0000-00000000001c	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-12-11 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
ac089d03-dc13-45ee-a4e3-8a737e0a46f2	b1000000-0000-0000-0000-00000000001d	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2024-12-10 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
217ccc5e-8afa-4f76-a3ab-0684798793a1	b1000000-0000-0000-0000-00000000001d	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2024-12-12 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
14c54976-071d-422e-9456-192678ee9662	b1000000-0000-0000-0000-00000000001d	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-12-14 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
ee9c1475-b71a-418a-b9cf-97cca64f86c2	b1000000-0000-0000-0000-00000000001d	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2024-12-16 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
d9e32190-5f44-4b92-8332-2db48617c485	b1000000-0000-0000-0000-00000000001d	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2024-12-18 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
ca512914-c80f-4dbe-a3f1-4164d658c723	b1000000-0000-0000-0000-00000000001f	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-01-07 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
adc6e1d9-1575-49a0-bb63-c948a142503c	b1000000-0000-0000-0000-00000000001f	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-01-09 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
e2381708-9608-4634-afa0-1395771beaa7	b1000000-0000-0000-0000-00000000001f	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-01-11 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
8f3213c4-2692-492b-a640-d4e74d0deaf0	b1000000-0000-0000-0000-00000000001f	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-01-13 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
05255a01-21af-4867-bb2c-a1a7a68052df	b1000000-0000-0000-0000-00000000001f	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-01-15 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
28515482-0589-4518-9109-37ac362be046	b1000000-0000-0000-0000-000000000020	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-01-14 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
4ea3abc5-7099-4e93-8bd2-9bf617e3a4a7	b1000000-0000-0000-0000-000000000020	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-01-16 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
d1043403-b8f3-4c67-b311-e30ca26b787d	b1000000-0000-0000-0000-000000000020	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-01-18 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
961820a1-7fe0-4569-9a55-f80134ff1e3d	b1000000-0000-0000-0000-000000000020	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-01-20 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
19c48bfe-adba-4edb-a954-812074dec86a	b1000000-0000-0000-0000-000000000020	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-01-22 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a35b8955-42b8-4f54-b8b5-e4f15608d1b3	b1000000-0000-0000-0000-000000000021	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-01-28 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
4f0eca08-4b10-4144-8146-a9f41a52b21c	b1000000-0000-0000-0000-000000000021	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-01-30 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
6958274f-d42c-4cd0-a2b3-890caa9624ef	b1000000-0000-0000-0000-000000000021	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-02-01 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
2951e7a7-b7b8-4773-9589-940b8625cd5f	b1000000-0000-0000-0000-000000000021	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-02-03 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
90fedd8b-bb4f-4551-a771-3bb4beecac29	b1000000-0000-0000-0000-000000000021	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-02-05 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
6149902e-67aa-480f-aab0-10ac1177913d	b1000000-0000-0000-0000-000000000022	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-02-04 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
699df850-b709-448e-873f-1459f5bbf96a	b1000000-0000-0000-0000-000000000022	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-02-06 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a6055cb8-df59-4500-9c76-f61314f8a59d	b1000000-0000-0000-0000-000000000022	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-02-08 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
b331f66d-0a52-46bc-aeca-d3eb863fa6ba	b1000000-0000-0000-0000-000000000022	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-02-10 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
e03bfc48-05dd-43aa-97f0-63c4f07fc7c7	b1000000-0000-0000-0000-000000000022	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-02-12 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
2ed3e249-1f9b-4161-9be4-35ad2a0afeac	b1000000-0000-0000-0000-000000000023	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-02-18 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
57c3654a-4b39-4f43-a2ed-d270b25eebdf	b1000000-0000-0000-0000-000000000023	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-02-20 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
218268a8-f7d4-427c-bb5d-917006374480	b1000000-0000-0000-0000-000000000023	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-02-22 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
ae50af27-f9a9-42e1-9dbc-2823971a6d50	b1000000-0000-0000-0000-000000000023	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-02-24 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
25975098-4422-47b5-9e7a-51a60e4c7c7a	b1000000-0000-0000-0000-000000000023	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-02-26 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
f35ab38f-61e1-473b-80f5-359dd8434206	b1000000-0000-0000-0000-000000000024	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-03-04 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a5e27078-ed47-4c57-8668-fd694e122cec	b1000000-0000-0000-0000-000000000024	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-03-06 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
27f9a694-220e-4924-b91b-3ac3370c693a	b1000000-0000-0000-0000-000000000024	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-03-08 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
38fb21a9-2581-4c1f-bc59-c7a3b1089206	b1000000-0000-0000-0000-000000000024	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-03-10 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
c5a66e9b-42ab-42a6-b719-ae095bb6768e	b1000000-0000-0000-0000-000000000024	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-03-12 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
e01397c2-8d9a-45ef-a2d9-c015d776a456	b1000000-0000-0000-0000-000000000025	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-03-11 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
c0a6a28e-1d8f-4fc0-bd88-ad0f0cf1630c	b1000000-0000-0000-0000-000000000025	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-03-13 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
b1f60c8d-90f9-4e1f-a202-aec99ddddb75	b1000000-0000-0000-0000-000000000025	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-03-15 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
8ff03746-cd4e-46fb-87b2-3bbab355afaf	b1000000-0000-0000-0000-000000000025	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-03-17 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
7d735811-c973-4757-aea6-4b4de88c0999	b1000000-0000-0000-0000-000000000025	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-03-19 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a534c797-60c1-4313-bb56-070c05e8cb3e	b1000000-0000-0000-0000-000000000026	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-04-01 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
c5a1182c-0270-40a2-bc40-6f6276889328	b1000000-0000-0000-0000-000000000026	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-04-03 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
01ae972f-7ff0-4114-a377-02fa0189415d	b1000000-0000-0000-0000-000000000026	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-04-05 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
de3ea0a3-d91a-444a-9a29-560485258557	b1000000-0000-0000-0000-000000000026	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-04-07 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
95a222bb-24a1-4c99-b255-fdb155a9ce9e	b1000000-0000-0000-0000-000000000026	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-04-09 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
8cfd5b1f-9022-4406-988d-b49af6471898	b1000000-0000-0000-0000-000000000027	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-04-15 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
43320ac2-eb0a-4459-acf1-9d90dadae9de	b1000000-0000-0000-0000-000000000027	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-04-17 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
311cba33-9bce-4712-bbab-9918deee0ff9	b1000000-0000-0000-0000-000000000027	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-04-19 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
1abb1a26-1948-43c8-8d5e-bdc3519b85f0	b1000000-0000-0000-0000-000000000027	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-04-21 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a0773c87-3816-4257-9d1e-7cdd17143a6a	b1000000-0000-0000-0000-000000000027	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-04-23 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
07ee9224-8b50-4dea-adea-443382dd0d86	b1000000-0000-0000-0000-000000000028	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-04-29 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
bce0cab3-a33a-47a8-b0c4-8cf07e199ae9	b1000000-0000-0000-0000-000000000028	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-05-01 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a731edd0-16ce-4876-aa1d-af2b136fd127	b1000000-0000-0000-0000-000000000028	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-05-03 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
90ccbf95-2d58-40bf-a607-05fe0db5bb90	b1000000-0000-0000-0000-000000000028	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-05-05 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
279ecbd3-c5ba-4495-a3e1-163d55c75f95	b1000000-0000-0000-0000-000000000028	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-05-07 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
6816fb03-c7fc-46de-88f2-f64902ce6aa3	b1000000-0000-0000-0000-000000000029	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-05-06 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
6128f28b-5a1f-41f9-b0db-d79d2cd699d0	b1000000-0000-0000-0000-000000000029	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-05-08 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
8699b123-40ac-4e32-8445-96e93b378653	b1000000-0000-0000-0000-000000000029	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-05-10 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
e62fb0a9-3ec7-494a-a78c-6ea635eb8309	b1000000-0000-0000-0000-000000000029	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-05-12 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
89072a28-4dc8-49c0-b5e8-541d4b08c766	b1000000-0000-0000-0000-000000000029	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-05-14 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
01483eae-cbdb-4d83-943c-5b757d5c6309	b1000000-0000-0000-0000-00000000002a	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-05-13 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
3a566cfa-f93f-4a16-b28d-be76783126d7	b1000000-0000-0000-0000-00000000002a	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-05-15 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
f07a2160-fb58-48f8-948a-91fc070ceefd	b1000000-0000-0000-0000-00000000002a	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-05-17 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
897c039a-ddf9-4886-beac-c66be91817e0	b1000000-0000-0000-0000-00000000002a	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-05-19 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
daabb406-d4ae-469f-bfa3-9f894d8f156d	b1000000-0000-0000-0000-00000000002a	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-05-21 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
8f5d9ad1-f6e6-44b0-a1ee-1ab9acb44b2f	b1000000-0000-0000-0000-00000000002b	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-05-27 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
9062521f-b45c-49c7-b2c1-6d76643c42df	b1000000-0000-0000-0000-00000000002b	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-05-29 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
19d117aa-904c-40fb-bfc3-1aa44ae66bdf	b1000000-0000-0000-0000-00000000002b	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-05-31 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
c2fd7035-6f36-4e78-acab-8e404daea4c4	b1000000-0000-0000-0000-00000000002b	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-06-02 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
45c57c4f-8a54-447a-b545-d10fffd4fe75	b1000000-0000-0000-0000-00000000002b	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-06-04 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
ab1b55ed-c006-4772-9e99-97e037e2cf65	b1000000-0000-0000-0000-00000000002c	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-06-10 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
8a14b1bc-ff38-461a-924a-e121240d29a8	b1000000-0000-0000-0000-00000000002c	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-06-12 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
e9e184d4-9a0e-43fa-b5cd-399dc16fe6d4	b1000000-0000-0000-0000-00000000002c	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-06-14 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
7a8d12ce-0ac6-4bdc-8d27-967867a731ff	b1000000-0000-0000-0000-00000000002c	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-06-16 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
c0d7d424-30d8-4879-b128-1eec74f080d4	b1000000-0000-0000-0000-00000000002c	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-06-18 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
482c23df-5fb4-4667-b82b-f76e29270685	b1000000-0000-0000-0000-00000000002d	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-06-24 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
b89c8234-b528-42e4-a335-f9ee9557380c	b1000000-0000-0000-0000-00000000002d	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-06-26 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
720aac37-2362-496e-8194-13366afbd7e4	b1000000-0000-0000-0000-00000000002d	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-06-28 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
c6fb67a0-c21a-4c01-abf7-bd368f27db47	b1000000-0000-0000-0000-00000000002d	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-06-30 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
0e5c5e93-00b8-4c6a-b60f-863121b4be69	b1000000-0000-0000-0000-00000000002d	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-07-02 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
db7295fd-c348-4ef0-a190-32a8ca901f45	b1000000-0000-0000-0000-00000000002e	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-07-08 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
788d7588-5769-4bc9-bdfc-6243299eef45	b1000000-0000-0000-0000-00000000002e	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-07-10 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
dbe9e1fa-4c01-4d40-a576-9f9eb9034830	b1000000-0000-0000-0000-00000000002e	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-07-12 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
f7bb9a11-5549-442c-97ae-3812245951b2	b1000000-0000-0000-0000-00000000002e	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-07-14 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
23c8ec33-b9fb-4341-b34d-7dcc52bc9f40	b1000000-0000-0000-0000-00000000002e	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-07-16 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
d4b1ac87-434b-4d85-8dd5-8081d34d89af	b1000000-0000-0000-0000-00000000002f	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-07-15 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
9e59453b-8153-4383-b219-567ae8b76d7b	b1000000-0000-0000-0000-00000000002f	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-07-17 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
ca1e6bc7-3f9d-439c-b173-361463ebf9ef	b1000000-0000-0000-0000-00000000002f	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-07-19 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
244b57d8-a50c-4af7-8a73-10f726f55f70	b1000000-0000-0000-0000-00000000002f	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-07-21 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
64fb791f-7ee8-4634-8acb-cd74c9acdb95	b1000000-0000-0000-0000-00000000002f	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-07-23 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
78a00ce9-3048-44b6-8f4f-e179d8b6d727	b1000000-0000-0000-0000-000000000030	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-07-29 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
825c6c0b-ff41-4b49-964b-5a656299a3a4	b1000000-0000-0000-0000-000000000030	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-07-31 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
5ffbb512-0c25-479f-90af-b519ed0b49f0	b1000000-0000-0000-0000-000000000030	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-08-02 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
65b3e4a2-30db-415f-a58c-d485de2efe90	b1000000-0000-0000-0000-000000000030	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-08-04 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
41a10e58-df53-4df6-9cf2-793b39d6704e	b1000000-0000-0000-0000-000000000030	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-08-06 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
4650b2b2-2ec1-406c-a574-02c1f6db9220	b1000000-0000-0000-0000-000000000031	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-08-12 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
8f7de11c-cf35-48c9-9556-bc62f592eb01	b1000000-0000-0000-0000-000000000031	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-08-14 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
75cef708-3350-4d41-8e8b-1198e0e533b2	b1000000-0000-0000-0000-000000000031	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-08-16 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
22e28569-17ec-4ec6-8d73-04eb5f2d764e	b1000000-0000-0000-0000-000000000031	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-08-18 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
ca309985-e271-4aa0-9836-0e718a29ee71	b1000000-0000-0000-0000-000000000031	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-08-20 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a33238fd-6b25-4e50-bf35-108f7dbf7955	b1000000-0000-0000-0000-000000000032	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-08-26 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
901831ab-fd94-423e-884a-e6814537697e	b1000000-0000-0000-0000-000000000032	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-08-28 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
2ab6e0b5-a19e-4d07-ab44-413aa0a52c1a	b1000000-0000-0000-0000-000000000032	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-08-30 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
40519714-ebb1-42bd-863b-05713b5196bc	b1000000-0000-0000-0000-000000000032	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-09-01 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
e5cfd2a1-bc13-4a26-9d01-7058d828f1ff	b1000000-0000-0000-0000-000000000032	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-09-03 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
286cdeef-1b9f-477e-a57e-95b2a1abdc85	b1000000-0000-0000-0000-000000000033	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-09-09 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
315ca8bf-5af2-42f2-b82c-60bdf1a680e2	b1000000-0000-0000-0000-000000000033	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-09-11 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
5bad48a8-0e25-435b-9420-b473cf8124f7	b1000000-0000-0000-0000-000000000033	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-09-13 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
c8a756e3-d55f-454f-9e0d-34b97123fa72	b1000000-0000-0000-0000-000000000033	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-09-15 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
432ac5ea-267f-4b5c-80ff-f460f3e18d6c	b1000000-0000-0000-0000-000000000033	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-09-17 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
7aab8fdd-bb91-47f5-bb0a-1fd16dd95462	b1000000-0000-0000-0000-000000000034	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-09-16 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a7847f53-2b99-4126-bb18-53e67ee9f3f4	b1000000-0000-0000-0000-000000000034	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-09-18 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
260d6b8a-924d-4146-ac39-daf33860ee0b	b1000000-0000-0000-0000-000000000034	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-09-20 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
c0b9e78c-bf16-483e-ade1-a63fc2eb9a44	b1000000-0000-0000-0000-000000000034	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-09-22 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
fbc59e42-5569-4a6b-9cbc-2eea8ce3e9e8	b1000000-0000-0000-0000-000000000034	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-09-24 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
d0c0a320-d48f-4892-b9ea-4cdc716fbaac	b1000000-0000-0000-0000-000000000035	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-09-30 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
2062a9cc-e9cd-48e9-bb45-34801479f19c	b1000000-0000-0000-0000-000000000035	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-10-02 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a4225f01-9386-4d72-a07b-2fa3208e7cf7	b1000000-0000-0000-0000-000000000035	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-10-04 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
c52694f5-187b-4008-8337-c4b234f526bb	b1000000-0000-0000-0000-000000000035	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-10-06 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
756716c9-41ea-4f77-b7dd-b7a372ad7c2b	b1000000-0000-0000-0000-000000000035	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-10-08 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
ded0a190-4401-48b6-851c-28769f9fabdd	b1000000-0000-0000-0000-000000000036	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-10-14 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
1ec1397b-1129-4ca6-a940-e24f71e6a2dc	b1000000-0000-0000-0000-000000000036	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-10-16 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
e025f9ae-6268-4bad-9a10-26f77bf7cb6d	b1000000-0000-0000-0000-000000000036	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-10-18 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
934339ee-8f78-4e1e-8969-57b82d62f3c1	b1000000-0000-0000-0000-000000000036	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-10-20 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
13f5398e-d69a-4c96-9759-9b3678597d8c	b1000000-0000-0000-0000-000000000036	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-10-22 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
5f2ee2aa-50dc-4211-85be-647b99a731b4	b1000000-0000-0000-0000-000000000037	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-10-28 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
582a524c-48b6-40cd-9159-4f299143c477	b1000000-0000-0000-0000-000000000037	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-10-30 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
d2b16a31-1a3f-4746-8b5a-a079d5c5d770	b1000000-0000-0000-0000-000000000037	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-11-01 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
ec8810a5-b49e-4ab7-8039-b5a05cddc6d5	b1000000-0000-0000-0000-000000000037	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-11-03 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
f41a21bd-247a-484f-8509-f2752e964bae	b1000000-0000-0000-0000-000000000037	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-11-05 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
6a19432e-7737-4378-9997-44ae9d64eba4	b1000000-0000-0000-0000-000000000038	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-11-11 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
e0a4c8d1-9893-4a04-be9f-f4bfdaa6adce	b1000000-0000-0000-0000-000000000038	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-11-13 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
9ecfae82-8869-41c2-9ac0-4ce66c7fd9bc	b1000000-0000-0000-0000-000000000038	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-11-15 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
9d2d0a62-5c23-4193-aea0-91d1334e915d	b1000000-0000-0000-0000-000000000038	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-11-17 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
55c8aa0c-6645-44be-90b7-d135a7bc9595	b1000000-0000-0000-0000-000000000038	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-11-19 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
5fdddf56-c896-4101-a4bd-b5c074dc5d01	b1000000-0000-0000-0000-00000000003b	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-11-25 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
4196cc2a-ba3b-42bd-b6f3-67f84580def7	b1000000-0000-0000-0000-00000000003b	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-11-27 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
5763f781-189f-4aaf-9c29-c0bbb1ae9656	b1000000-0000-0000-0000-00000000003b	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-11-29 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
6a762c81-ffd5-4581-aee5-7c2663fbb171	b1000000-0000-0000-0000-00000000003b	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-12-01 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
a3c93797-eadf-4b9a-9c33-c3a550a11b05	b1000000-0000-0000-0000-00000000003b	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-12-03 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
e51de703-612e-4988-8655-e12fa8e83e00	b1000000-0000-0000-0000-00000000003c	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-12-02 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
3de9b5b4-b64b-47c5-81e5-f012bd990682	b1000000-0000-0000-0000-00000000003c	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-12-04 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
cbc36410-3ef4-4987-ba06-223766cd8b5d	b1000000-0000-0000-0000-00000000003c	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-12-06 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
c2baa1fa-3404-4559-826c-c370f66688b1	b1000000-0000-0000-0000-00000000003c	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-12-08 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
b8104e5b-afc1-41ec-b401-476641e87e99	b1000000-0000-0000-0000-00000000003c	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-12-10 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
1f700e8d-80dc-474f-8dc6-92add0c493a2	b1000000-0000-0000-0000-000000000039	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-12-02 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
8159c097-e3c5-4610-a000-c5db5ac98c75	b1000000-0000-0000-0000-000000000039	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-12-04 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
66f539ee-8b2e-4543-b244-d611dd7185b6	b1000000-0000-0000-0000-000000000039	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-12-06 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
6ec2e9d1-d5a0-475c-9a90-246ee75e3dd6	b1000000-0000-0000-0000-000000000039	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-12-08 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
93e6521c-5e8a-4f80-bf94-ba77b8e3251a	b1000000-0000-0000-0000-000000000039	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-12-10 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
cb526bd6-659e-4f1d-898d-a1c1d428d2eb	b1000000-0000-0000-0000-00000000003a	4	Reports of working groups	Reports from working groups.	INFORMATION	MEDIUM	ACTIVE	2025-12-09 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
86507664-942e-47b1-baf9-580b9990ed78	b1000000-0000-0000-0000-00000000003a	5	Draft amendments and guidelines	Draft amendments and guidelines for consideration.	DECISION	HIGH	ACTIVE	2025-12-11 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
d120efee-ebc1-4300-93ce-692eee0db81b	b1000000-0000-0000-0000-00000000003a	6	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-12-13 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
2f6113ae-b276-4c28-8818-c077bb75d78e	b1000000-0000-0000-0000-00000000003a	7	Consideration of submissions	Consideration of member state submissions.	DISCUSSION	MEDIUM	ACTIVE	2025-12-15 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
637bb4d7-6770-41ff-b610-bd0f0b511c4a	b1000000-0000-0000-0000-00000000003a	8	Date and place of next session	To be determined.	INFORMATION	LOW	ACTIVE	2025-12-17 17:00:00+00	2026-03-01 07:55:57.339362+00	2026-03-01 07:55:57.339362+00	c1000000-0000-0000-0000-000000000001
6a8413e4-998a-4f4d-8c28-68f44ae25067	b1000000-0000-0000-0000-000000000001	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-01-08 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
05de5831-6caf-4bec-863c-37e351c98f8a	b1000000-0000-0000-0000-000000000001	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-01-08 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
9a05fb7d-7e2a-42c2-a59e-2fc4052859bb	b1000000-0000-0000-0000-000000000001	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-01-08 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
f2a44738-9f60-44de-8548-ca9350b18ffe	b1000000-0000-0000-0000-000000000002	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-01-15 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
5fc904d9-90c9-4c43-8ff3-e36f182335b6	b1000000-0000-0000-0000-000000000002	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-01-15 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
fbe93afb-db79-43f9-8a2b-59af47cf3b3c	b1000000-0000-0000-0000-000000000002	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-01-15 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
6190b393-c737-49a2-bd1f-3e08af1e9ee0	b1000000-0000-0000-0000-000000000003	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-01-29 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
8f73d151-6046-4bd1-b2c1-c4cd3273f52a	b1000000-0000-0000-0000-000000000003	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-01-29 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
25dac2b1-7350-4a69-bd9d-13bec4eceb47	b1000000-0000-0000-0000-000000000003	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-01-29 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
43fc75f5-b484-4a97-a863-2705814d0abf	b1000000-0000-0000-0000-000000000004	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-02-12 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
7098f9d4-99bc-49ff-8ee7-0671ab8278c7	b1000000-0000-0000-0000-000000000004	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-02-12 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
4992fd92-9fcf-47ee-97f1-e1241dfde1b3	b1000000-0000-0000-0000-000000000004	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-02-12 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
5054cd70-098f-4afb-9107-164870507fa9	b1000000-0000-0000-0000-000000000005	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-02-19 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
2a382a74-d085-46c8-9b7c-9053e48ccec0	b1000000-0000-0000-0000-000000000005	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-02-19 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
d3c3d2d8-097d-45fe-8ae3-bb9e2447d5ca	b1000000-0000-0000-0000-000000000005	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-02-19 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
21b86d5b-5378-4765-ba64-eaf4aed72ff7	b1000000-0000-0000-0000-000000000006	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-02-26 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
8c22ffe4-5e4c-4882-b7e2-577f8d6b5196	b1000000-0000-0000-0000-000000000006	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-02-26 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
6029b816-18dd-418f-96e6-843bfe4c686c	b1000000-0000-0000-0000-000000000006	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-02-26 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
716aba8f-7062-4a00-851c-831c30eea57c	b1000000-0000-0000-0000-000000000007	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-03-04 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
ad455173-6650-4de0-80b5-c6082fbfca12	b1000000-0000-0000-0000-000000000007	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-03-04 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
f2515efa-5b61-49d3-9e7e-11bd9c57e3b6	b1000000-0000-0000-0000-000000000007	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-03-04 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
8bb5d502-281e-4d77-91fe-ec7706be4dc9	b1000000-0000-0000-0000-000000000008	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-03-11 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
fc2f6aea-625f-418f-a3e9-ef862057d034	b1000000-0000-0000-0000-000000000008	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-03-11 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
051d6efa-8e39-4b95-a2b0-17cb3e1dd8dd	b1000000-0000-0000-0000-000000000008	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-03-11 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
994cc471-01c6-4097-8fb0-e52b387cc074	b1000000-0000-0000-0000-000000000009	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-03-25 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
cfedc90b-2704-4b99-8571-ac8cec1646f0	b1000000-0000-0000-0000-000000000009	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-03-25 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
bbbe7b7c-6e50-4d7f-81a3-bf4012df4840	b1000000-0000-0000-0000-000000000009	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-03-25 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
896a955f-bb99-4d42-9887-5990e5993e2d	b1000000-0000-0000-0000-00000000000a	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-04-01 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
31d3b979-dcda-49a7-a0bf-d4d4e6c32b20	b1000000-0000-0000-0000-00000000000a	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-04-01 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
8e142f11-4cca-4058-8767-ae335c90b060	b1000000-0000-0000-0000-00000000000a	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-04-01 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
4df118a2-7a8d-4a1c-b01d-f275a0d155fb	b1000000-0000-0000-0000-00000000000b	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-04-15 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
f9642255-b0ed-4c4f-8118-8d0f411f1636	b1000000-0000-0000-0000-00000000000b	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-04-15 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
b391cc19-6e1f-431b-9cbf-0c1beb6fb0c9	b1000000-0000-0000-0000-00000000000b	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-04-15 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
7d32e028-889c-4095-8350-9602bf1ed191	b1000000-0000-0000-0000-00000000000c	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-05-06 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
fdf6ff13-7bf9-4ac6-bf9f-2d0fb14cbb01	b1000000-0000-0000-0000-00000000000c	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-05-06 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
8f2cec1e-6445-418c-bfeb-323e12e20258	b1000000-0000-0000-0000-00000000000c	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-05-06 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
b6ba57bc-acd4-4b19-a621-df1f7b207c73	b1000000-0000-0000-0000-00000000000d	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-05-13 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
8c87657d-5534-464a-8eb6-cbe6b8b4cfd1	b1000000-0000-0000-0000-00000000000d	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-05-13 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
939acd5d-fc75-46d2-ab59-3e04f69aa295	b1000000-0000-0000-0000-00000000000d	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-05-13 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
311db43c-6166-4039-9a01-989a4424bf04	b1000000-0000-0000-0000-00000000000e	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-05-27 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
70617b15-5b31-4816-b141-7d6d4ac21576	b1000000-0000-0000-0000-00000000000e	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-05-27 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
35251103-a8b1-4968-b3f9-da0d12e4a883	b1000000-0000-0000-0000-00000000000e	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-05-27 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
b760084d-6802-4d3a-929f-6f93e4898fbd	b1000000-0000-0000-0000-00000000000f	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-06-10 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
fd310342-218e-427e-b423-271b4ece6f46	b1000000-0000-0000-0000-00000000000f	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-06-10 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
b2be6250-65e8-4bfc-97b1-d41dfc89d64f	b1000000-0000-0000-0000-00000000000f	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-06-10 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
b7e059d7-011f-40d0-a456-0a8c6dc8c714	b1000000-0000-0000-0000-000000000010	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-06-24 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
e57a624d-451a-4d24-b20f-f301bd9688aa	b1000000-0000-0000-0000-000000000010	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-06-24 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
f14e03ee-f044-44a8-b2dd-b9b91a9c4768	b1000000-0000-0000-0000-000000000010	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-06-24 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
137a7a86-01a2-4b28-83ff-b0513010764e	b1000000-0000-0000-0000-000000000011	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-07-08 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
b1c20255-f924-4b3c-b61f-cd1887800bfe	b1000000-0000-0000-0000-000000000011	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-07-08 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
c92ae940-0198-4175-9d5d-9e5c268eb0c3	b1000000-0000-0000-0000-000000000011	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-07-08 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
b37ea050-49b1-4b96-9479-8a4760b12024	b1000000-0000-0000-0000-000000000012	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-07-15 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
83a970c5-1b2f-4b74-9fc2-0e3d8015e022	b1000000-0000-0000-0000-000000000012	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-07-15 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
5cbf5636-c029-424b-a50a-35c4adca1cd9	b1000000-0000-0000-0000-000000000012	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-07-15 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
195de67f-8041-4656-8fac-f3cad2b2cc9f	b1000000-0000-0000-0000-000000000013	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-07-29 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
d2c6f06a-99e7-4898-b654-e362f2239c74	b1000000-0000-0000-0000-000000000013	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-07-29 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
0ad61ccd-5025-4a35-80f4-57939e589ba7	b1000000-0000-0000-0000-000000000013	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-07-29 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
eaf81d44-6341-4e16-b8c3-28e61a1d9ce5	b1000000-0000-0000-0000-000000000014	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-08-12 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
68979cb0-c1c6-424a-99d2-48ee914c7b6e	b1000000-0000-0000-0000-000000000014	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-08-12 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
f797e959-93b9-4266-9f46-3a64b086ace4	b1000000-0000-0000-0000-000000000014	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-08-12 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
ba1c07e5-b170-4a88-b677-35a65690a55b	b1000000-0000-0000-0000-000000000015	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-08-26 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
5f6e4238-9432-4f1b-aa9f-6cfe0951b036	b1000000-0000-0000-0000-000000000015	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-08-26 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
d003b5c7-521b-4ab0-b78b-fa4b404aca66	b1000000-0000-0000-0000-000000000015	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-08-26 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
4e4ddbf0-0263-4777-99b2-458217b8ee77	b1000000-0000-0000-0000-000000000016	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-09-09 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
bc9951de-4d14-40a8-90fb-3e8d2a2ff82f	b1000000-0000-0000-0000-000000000016	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-09-09 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
18f4f62d-84cd-4f7e-9f54-f7696b8001c0	b1000000-0000-0000-0000-000000000016	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-09-09 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
37cedb6d-02af-48cf-8cbb-3d5c5e117e56	b1000000-0000-0000-0000-000000000017	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-09-16 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
e81f7cb1-838a-4337-8ad5-a2669de77564	b1000000-0000-0000-0000-000000000017	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-09-16 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
a952b53e-091b-4083-98fc-c2daec9fdf98	b1000000-0000-0000-0000-000000000017	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-09-16 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
46715ce2-ce32-48d4-8c6d-e9a60c99b738	b1000000-0000-0000-0000-000000000018	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-09-30 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
1961a599-1ee6-48a9-8472-6a86ed2f4a11	b1000000-0000-0000-0000-000000000018	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-09-30 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
91077b28-bb95-4ffa-acad-dcb95adfedea	b1000000-0000-0000-0000-000000000018	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-09-30 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
49e7d843-26b7-4f0e-9685-186c5a024aa8	b1000000-0000-0000-0000-000000000019	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-10-14 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
dcca656c-18cf-45fa-8d2d-8474dc42d62b	b1000000-0000-0000-0000-000000000019	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-10-14 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
42c0bfc0-5f1b-41d1-8046-974340c015a1	b1000000-0000-0000-0000-000000000019	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-10-14 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
071cb1dd-f342-40cd-97c8-169b9b88a15b	b1000000-0000-0000-0000-00000000001a	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-10-28 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
b1072e71-0c00-44bd-8d4d-c4e31f7895e7	b1000000-0000-0000-0000-00000000001a	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-10-28 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
501354c1-b8e9-4ffe-85e4-9efcadbdf721	b1000000-0000-0000-0000-00000000001a	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-10-28 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
290fee3c-848c-4cdb-a04c-ccf0a688196c	b1000000-0000-0000-0000-00000000001b	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-11-11 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
11c1868a-3dcc-42cc-8bf5-7f72882bc3e6	b1000000-0000-0000-0000-00000000001b	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-11-11 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
45c24685-3d97-48d4-9c49-45fac933f144	b1000000-0000-0000-0000-00000000001b	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-11-11 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
ac1ce8bc-5566-46f3-85e9-165b1c739237	b1000000-0000-0000-0000-00000000001c	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-12-02 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
1a495e0e-88b8-414a-af0c-0668b87f1d0f	b1000000-0000-0000-0000-00000000001c	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-12-02 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
58e54fd2-75fd-4e20-a815-4dcfee5d28fc	b1000000-0000-0000-0000-00000000001c	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-12-02 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
9de4f160-d9fd-4649-81e1-d4f701479460	b1000000-0000-0000-0000-00000000001d	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-12-09 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
d706da5b-786b-49d6-941e-6c517c5c22e4	b1000000-0000-0000-0000-00000000001d	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-12-09 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
41e0403d-73d5-4c5e-a7fd-76e93af58f04	b1000000-0000-0000-0000-00000000001d	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-12-09 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
ef07d071-e1f0-4d64-842a-97ef34228f92	b1000000-0000-0000-0000-00000000001e	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2024-11-25 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
32a45893-9140-41b0-821a-9026778c63cf	b1000000-0000-0000-0000-00000000001e	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2024-11-25 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
fefc039a-ce70-4da8-ad7c-925960ada5b6	b1000000-0000-0000-0000-00000000001e	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2024-11-25 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
e9a4ea34-f414-4066-9fe1-06248f0e47d1	b1000000-0000-0000-0000-00000000001f	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-01-06 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
0651c808-2691-48e0-a487-e11a34abb510	b1000000-0000-0000-0000-00000000001f	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-01-06 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
5bebed50-45aa-481d-bdf5-6c8f6fd0771e	b1000000-0000-0000-0000-00000000001f	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-01-06 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
fe2505dd-cb55-4ba0-b5f2-826680767363	b1000000-0000-0000-0000-000000000020	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-01-13 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
21599ac6-e55f-4b7f-bc64-524a05cffded	b1000000-0000-0000-0000-000000000020	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-01-13 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
4c6ff3ae-cb26-4579-bd51-8cb4275d3cb8	b1000000-0000-0000-0000-000000000020	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-01-13 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
1114bbbf-ffee-4c6e-8674-676767b8d16a	b1000000-0000-0000-0000-000000000021	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-01-27 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
3cff8fab-1c52-4b93-be17-6c07f5d908a9	b1000000-0000-0000-0000-000000000021	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-01-27 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
4385efbd-5193-4b55-bb9b-0f2e9e66b2c6	b1000000-0000-0000-0000-000000000021	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-01-27 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
4ece65ab-16ab-4de5-841c-4fb2acafcd93	b1000000-0000-0000-0000-000000000022	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-02-03 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
02575ba5-b22b-495b-ae8b-a83db2036dd5	b1000000-0000-0000-0000-000000000022	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-02-03 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
04b4a799-3d24-4a43-81d3-9569a8baa843	b1000000-0000-0000-0000-000000000022	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-02-03 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
937f6e68-f1af-49bf-b565-d42d64086a82	b1000000-0000-0000-0000-000000000023	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-02-17 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
93733ffd-5c72-4353-b004-5e50a3268c88	b1000000-0000-0000-0000-000000000023	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-02-17 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
15334002-5d2e-44f4-8ebd-7cbfdebb92b3	b1000000-0000-0000-0000-000000000023	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-02-17 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
143584e4-aae5-4bad-9a56-5016860d19df	b1000000-0000-0000-0000-000000000024	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-03-03 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
9b9e552d-45df-4d02-a054-cd5f4e21953e	b1000000-0000-0000-0000-000000000024	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-03-03 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
bcbc7e07-62b9-4a6e-a74d-e7146987e7ad	b1000000-0000-0000-0000-000000000024	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-03-03 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
5d8350c3-4dc8-470c-9582-ff16b9fe09d5	b1000000-0000-0000-0000-000000000025	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-03-10 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
e5b2186a-da33-4e87-8ba7-dda715885b23	b1000000-0000-0000-0000-000000000025	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-03-10 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
83d22400-c5b1-4ba8-a3d6-d9c35eaf6700	b1000000-0000-0000-0000-000000000025	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-03-10 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
23850b57-a4b2-4f77-b0f3-7e857a9d57c3	b1000000-0000-0000-0000-000000000026	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-03-31 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
3348046a-8d51-41a1-b4c8-407e89f3bcfe	b1000000-0000-0000-0000-000000000026	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-03-31 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
26b75108-ae45-4004-89df-a411bd37d495	b1000000-0000-0000-0000-000000000026	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-03-31 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
187374ca-6c55-44a0-a102-64c88a8d61c1	b1000000-0000-0000-0000-000000000027	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-04-14 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
a00b4ccc-a17b-478c-bab7-556345d77848	b1000000-0000-0000-0000-000000000027	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-04-14 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
90d4122b-2512-4ba1-96bb-ddc22eb8fc7e	b1000000-0000-0000-0000-000000000027	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-04-14 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
b57ba850-e834-45cc-bb4c-fb4115d04412	b1000000-0000-0000-0000-000000000028	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-04-28 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
b05915a8-9e0b-4fb7-83ec-d1aab66e12be	b1000000-0000-0000-0000-000000000028	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-04-28 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
9e73c390-5feb-46cf-9800-2d70e6ffd5ee	b1000000-0000-0000-0000-000000000028	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-04-28 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
190f3c51-f9c4-4582-a274-8cc73396515b	b1000000-0000-0000-0000-000000000029	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-05-05 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
284199de-5402-46d9-acc9-499bafa89b91	b1000000-0000-0000-0000-000000000029	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-05-05 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
ad58249e-977b-49d6-812f-b0692b997239	b1000000-0000-0000-0000-000000000029	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-05-05 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
0b30aa32-0610-471e-a66e-b15a4a1510f2	b1000000-0000-0000-0000-00000000002a	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-05-12 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
ec8f723a-a04c-49a3-bf7c-a9afa2ad03b9	b1000000-0000-0000-0000-00000000002a	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-05-12 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
fb0f0f79-d568-45f5-b9bf-8a1cba5b2e25	b1000000-0000-0000-0000-00000000002a	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-05-12 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
4de4658e-02d0-43c4-8112-a99616b8c3ba	b1000000-0000-0000-0000-00000000002b	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-05-26 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
3d2fd5a1-4344-49a8-a891-56a9d2866077	b1000000-0000-0000-0000-00000000002b	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-05-26 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
cf1d1bff-da4e-4075-a47a-3c0c6ced7ad5	b1000000-0000-0000-0000-00000000002b	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-05-26 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
60184d2b-6e4f-48ba-b318-95ff17b541ae	b1000000-0000-0000-0000-00000000002c	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-06-09 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
b6803604-8066-4f4d-8d3d-2efdce619cde	b1000000-0000-0000-0000-00000000002c	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-06-09 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
5cebffa1-8157-4db3-87fa-bb8f9f0fc10a	b1000000-0000-0000-0000-00000000002c	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-06-09 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
74af61c6-ca61-4f0a-89dc-01739b4fc0ea	b1000000-0000-0000-0000-00000000002d	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-06-23 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
553c98c5-a6fe-485f-8cd9-4a17e74e0c7b	b1000000-0000-0000-0000-00000000002d	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-06-23 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
a1405c57-4676-4dd2-8142-ea738085fa2f	b1000000-0000-0000-0000-00000000002d	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-06-23 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
70206091-ad7d-443f-949f-25a2c4f91f0a	b1000000-0000-0000-0000-00000000002e	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-07-07 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
4b739cc3-13c4-4846-80fd-451105de7b9d	b1000000-0000-0000-0000-00000000002e	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-07-07 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
c8da7a6d-d339-46be-a559-21d5cf05d429	b1000000-0000-0000-0000-00000000002e	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-07-07 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
16183e3b-e96d-4966-9de1-7a529c90cb5a	b1000000-0000-0000-0000-00000000002f	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-07-14 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
f98194ec-0e1f-47a4-9470-c71d6f3b2ff6	b1000000-0000-0000-0000-00000000002f	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-07-14 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
79a84053-0bb7-40dd-a048-6bbf6d3ae7fb	b1000000-0000-0000-0000-00000000002f	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-07-14 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
b7315f4b-1000-4b83-ab1e-b212e24ce035	b1000000-0000-0000-0000-000000000030	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-07-28 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
70a5e1f4-92cd-4a9f-a88e-c9b8989efd18	b1000000-0000-0000-0000-000000000030	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-07-28 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
f3a0f22a-07a7-45e0-a916-5c9f94428f02	b1000000-0000-0000-0000-000000000030	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-07-28 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
1b6c2e53-41ef-40db-bdf1-ee6c4836f64c	b1000000-0000-0000-0000-000000000031	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-08-11 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
1d5d3479-c5bf-477a-844a-05b139701e83	b1000000-0000-0000-0000-000000000031	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-08-11 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
860d82d2-055d-4c51-a0a2-c99b745dc318	b1000000-0000-0000-0000-000000000031	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-08-11 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
5a6f9749-1654-447b-942b-c8d163b72026	b1000000-0000-0000-0000-000000000032	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-08-25 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
8ddb3d44-27f2-46d5-94da-758feaf4a5bd	b1000000-0000-0000-0000-000000000032	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-08-25 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
2b80528b-f902-47d5-9126-f16294cad18c	b1000000-0000-0000-0000-000000000032	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-08-25 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
4accf564-9977-44d2-8c67-3d914f531b7c	b1000000-0000-0000-0000-000000000033	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-09-08 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
f38055ab-245d-477d-9c27-28340a9e753d	b1000000-0000-0000-0000-000000000033	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-09-08 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
7529fffd-b4fa-41d6-84f8-41cb56764596	b1000000-0000-0000-0000-000000000033	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-09-08 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
a64f3575-4fca-43a6-a273-c6942ab95981	b1000000-0000-0000-0000-000000000034	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-09-15 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
73659417-4b13-4441-8d9a-506e0f95b85b	b1000000-0000-0000-0000-000000000034	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-09-15 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
8c4675ce-09ba-422d-ab99-c7bfe6086f97	b1000000-0000-0000-0000-000000000034	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-09-15 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
78663203-e204-4e1c-b21b-790000e4b717	b1000000-0000-0000-0000-000000000035	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-09-29 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
be5775bc-76fc-4348-b8a7-c5c385d8d1be	b1000000-0000-0000-0000-000000000035	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-09-29 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
812faec3-5c6a-4e60-ba24-c57586c8f855	b1000000-0000-0000-0000-000000000035	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-09-29 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
ddfd376c-847d-424e-a60d-6dda9a515fa1	b1000000-0000-0000-0000-000000000036	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-10-13 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
ec4834de-b660-4ac7-b2cf-dfa0a1cb1ec1	b1000000-0000-0000-0000-000000000036	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-10-13 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
cea68de2-e0dd-4f4e-8e94-c8c91a0e508f	b1000000-0000-0000-0000-000000000036	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-10-13 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
f8bb1c8c-7ea3-4ddb-b1b5-0e008d72de8c	b1000000-0000-0000-0000-000000000037	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-10-27 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
8dff370b-e9c7-4de0-ae95-20832cb8d350	b1000000-0000-0000-0000-000000000037	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-10-27 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
b3e9c938-b51e-4482-b9f9-8e6b0c971e8d	b1000000-0000-0000-0000-000000000037	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-10-27 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
1543928b-3c65-47fd-b5e5-56ac489a2a60	b1000000-0000-0000-0000-000000000038	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-11-10 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
c71dbc5a-8bf6-49c3-89a0-c684906d3eb0	b1000000-0000-0000-0000-000000000038	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-11-10 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
5e2d10a1-d1bf-41e5-bb96-f12093f2fc44	b1000000-0000-0000-0000-000000000038	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-11-10 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
436bcbf9-1f18-410f-9fb1-5fb8c0176056	b1000000-0000-0000-0000-000000000039	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-12-01 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
d50ec593-858d-4fe2-9cd4-0aedc09a8743	b1000000-0000-0000-0000-000000000039	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-12-01 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
d79c4368-a1b3-47b1-8f39-5c29456558d6	b1000000-0000-0000-0000-000000000039	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-12-01 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
cea10fef-3006-4a22-9c77-d9ba2cd78ce3	b1000000-0000-0000-0000-00000000003a	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-12-08 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
c7e526a6-658f-41e2-8b8e-3e2d2b397d18	b1000000-0000-0000-0000-00000000003a	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-12-08 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
8e3f1f6a-dfa2-4e48-884f-6605a7de5d7b	b1000000-0000-0000-0000-00000000003a	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-12-08 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
3b83d52e-cee6-4183-ab09-1caf7d391670	b1000000-0000-0000-0000-00000000003b	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-11-24 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
3f475500-8033-47af-9fb8-108016b37b20	b1000000-0000-0000-0000-00000000003b	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-11-24 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
80ff0edb-d1de-42f3-a33e-a727848188c7	b1000000-0000-0000-0000-00000000003b	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-11-24 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
b15ca755-de86-4d0d-b820-fe270c99b94f	b1000000-0000-0000-0000-00000000003c	1	Adoption of the agenda	Agenda as circulated.	DISCUSSION	HIGH	ACTIVE	2025-12-01 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
62cc7d0c-2139-4c56-9ecf-75134fb2e63a	b1000000-0000-0000-0000-00000000003c	2	Report of the Chair	Report on intersessional work.	INFORMATION	MEDIUM	ACTIVE	2025-12-01 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
a3cc89b2-abc0-43f2-9a49-242927bdba2f	b1000000-0000-0000-0000-00000000003c	3	Any other business	Items raised under AOB.	ANY_OTHER_BUSINESS	LOW	ACTIVE	2025-12-01 17:00:00+00	2026-03-01 06:58:06.960313+00	2026-03-01 06:58:06.960313+00	c1000000-0000-0000-0000-000000000001
\.


--
-- Data for Name: international_bodies; Type: TABLE DATA; Schema: core; Owner: isep_app
--

COPY core.international_bodies (body_id, parent_body_id, name, abbreviation, body_type, description, is_active, created_at, updated_at) FROM stdin;
a0000000-0000-0000-0000-000000000002	\N	Council	COUNCIL	COUNCIL	IMO Council	t	2026-03-01 06:55:12.22896+00	2026-03-01 06:55:12.22896+00
a0000000-0000-0000-0000-000000000004	\N	Marine Environment Protection Committee	MEPC	COMMITTEE	IMO MEPC	t	2026-03-01 06:55:12.22896+00	2026-03-01 06:55:12.22896+00
a0000000-0000-0000-0000-000000000005	\N	Legal Committee	LEGAL	COMMITTEE	IMO Legal Committee	t	2026-03-01 06:55:12.22896+00	2026-03-01 06:55:12.22896+00
a0000000-0000-0000-0000-000000000006	\N	Technical Cooperation Committee	TCC	COMMITTEE	IMO TCC	t	2026-03-01 06:55:12.22896+00	2026-03-01 06:55:12.22896+00
a0000000-0000-0000-0000-000000000007	\N	Facilitation Committee	FAL	COMMITTEE	IMO FAL	t	2026-03-01 06:55:12.22896+00	2026-03-01 06:55:12.22896+00
a0000000-0000-0000-0000-000000000008	\N	Human Element, Training and Watchkeeping	HTW	SUB_COMMITTEE	IMO HTW	t	2026-03-01 06:55:12.22896+00	2026-03-01 06:55:12.22896+00
a0000000-0000-0000-0000-000000000009	\N	Implementation of IMO Instruments	III	SUB_COMMITTEE	IMO III	t	2026-03-01 06:55:12.22896+00	2026-03-01 06:55:12.22896+00
a0000000-0000-0000-0000-00000000000a	\N	Navigation, Communications and Search & Rescue	NCSR	SUB_COMMITTEE	IMO NCSR	t	2026-03-01 06:55:12.22896+00	2026-03-01 06:55:12.22896+00
a0000000-0000-0000-0000-00000000000c	\N	Ship Design and Construction	SDC	SUB_COMMITTEE	IMO SDC	t	2026-03-01 06:55:12.22896+00	2026-03-01 06:55:12.22896+00
a0000000-0000-0000-0000-00000000000d	\N	Ship Systems and Equipment	SSE	SUB_COMMITTEE	IMO SSE	t	2026-03-01 06:55:12.22896+00	2026-03-01 06:55:12.22896+00
a0000000-0000-0000-0000-00000000000e	\N	Carriage of Cargoes and Containers	CCC	SUB_COMMITTEE	IMO CCC	t	2026-03-01 06:55:12.22896+00	2026-03-01 06:55:12.22896+00
a0000000-0000-0000-0000-000000000003	a0000000-0000-0000-0000-000000000004	Maritime Safety Committee	MSC	COMMITTEE	IMO MSC	t	2026-03-01 06:55:12.22896+00	2026-03-02 18:03:08.403163+00
a0000000-0000-0000-0000-00000000000b	a0000000-0000-0000-0000-000000000004	Pollution Prevention and Response	PPR	COUNCIL	Poluution Prevention for Sea	t	2026-03-01 06:55:12.22896+00	2026-03-03 04:16:55.268827+00
237fe69c-db32-4cb0-a8b2-fe1a9b5203d2	a0000000-0000-0000-0000-000000000005	Legal Weapon Control Committe	LWCC	COMMITTEE	Controlling usage of legal weapons in water area	t	2026-03-03 04:18:23.929955+00	2026-03-03 04:18:23.929955+00
a0000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-00000000000a	Communication during Search and Rescue	CSR	ASSEMBLY	IMO Assembly	t	2026-03-01 06:55:12.22896+00	2026-03-03 17:58:13.599095+00
0ba24eae-6aef-4010-9a19-d9057cf7bf80	a0000000-0000-0000-0000-000000000003	Safety during Fire Fighting	SFF	WORKING_GROUP	Working Group to setup drill committe and finalize SoP for fire fire fighting.	t	2026-03-03 18:00:07.702178+00	2026-03-03 18:00:42.082595+00
\.


--
-- Data for Name: meeting_correspondence_groups; Type: TABLE DATA; Schema: core; Owner: isep_app
--

COPY core.meeting_correspondence_groups (meeting_id, cg_id) FROM stdin;
d862c38d-38e7-4bec-9c65-05cb39dd54c4	6ea45bdd-ab9e-4a2e-bff4-c57ead75997c
d862c38d-38e7-4bec-9c65-05cb39dd54c4	31879258-4eca-4392-882f-2a9b44e6910b
\.


--
-- Data for Name: meeting_interventions; Type: TABLE DATA; Schema: core; Owner: isep_app
--

COPY core.meeting_interventions (intervention_id, meeting_id, agenda_item_id, intervention_text, delivered_by_user_id, delivered_by_name, delivered_at, intervention_type, created_at) FROM stdin;
\.


--
-- Data for Name: meeting_outcomes; Type: TABLE DATA; Schema: core; Owner: isep_app
--

COPY core.meeting_outcomes (outcome_id, meeting_id, agenda_item_id, decision, resolution_ref, next_steps, captured_at, captured_by_user_id) FROM stdin;
\.


--
-- Data for Name: meeting_participants; Type: TABLE DATA; Schema: core; Owner: isep_app
--

COPY core.meeting_participants (participant_id, meeting_id, user_id, meeting_role, assigned_by, assigned_at) FROM stdin;
c12fe56a-ba10-4fb5-8014-a43dcf946394	b1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
75c5d38f-d5cb-408a-9b93-1e2c598177fb	b1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
2c72d950-7b64-4b43-bfee-30880abc2521	b1000000-0000-0000-0000-000000000002	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
5289cb04-a6e1-4f96-bd3b-9614489eff93	b1000000-0000-0000-0000-000000000002	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
00210269-f6a8-41f7-b712-9ae506db40a2	b1000000-0000-0000-0000-000000000003	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
29df08b3-fafd-49a9-adb5-a558db311ebf	b1000000-0000-0000-0000-000000000003	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
4974ef75-13df-4eed-926c-35fe7e4074d0	b1000000-0000-0000-0000-000000000004	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
9e9f0218-4347-4a5e-bf8c-7eb9ea3d3dda	b1000000-0000-0000-0000-000000000004	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
7f23b296-ece6-4808-a3a6-28e43d7e37f4	b1000000-0000-0000-0000-000000000005	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
05d09b10-a7e7-4a38-9930-dbcbec3a55f0	b1000000-0000-0000-0000-000000000005	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
76000b5b-bf0d-4884-b843-4b2d04e4634f	b1000000-0000-0000-0000-000000000006	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
221cd258-11ff-44aa-9452-94689c6841fa	b1000000-0000-0000-0000-000000000006	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
d56e989a-f990-434c-9bf5-9ad1ee8eaa66	b1000000-0000-0000-0000-000000000007	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
ee1d08f2-1a47-4872-a9c1-5b1c6d258419	b1000000-0000-0000-0000-000000000007	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
7bfd5526-23ae-4194-a8bd-11dbb5ac3e3b	b1000000-0000-0000-0000-000000000008	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
60e7589d-0327-4916-9e80-5590492fda38	b1000000-0000-0000-0000-000000000008	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
be72f0af-77bc-4ffa-a668-970a01a7d2b2	b1000000-0000-0000-0000-000000000009	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
b7fb0430-04e4-422c-bc20-e17a46943375	b1000000-0000-0000-0000-000000000009	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
f76f879b-6541-4d1f-a25b-3539f0517b87	b1000000-0000-0000-0000-00000000000a	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
b1d2eb5a-8a67-42da-a183-79a20922f1cd	b1000000-0000-0000-0000-00000000000a	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
f0ab16ba-ce6f-494e-b351-e57cc28f3390	b1000000-0000-0000-0000-00000000000b	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
acb353c3-ab51-4ad4-baee-6aac02c85710	b1000000-0000-0000-0000-00000000000b	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
3b47ed39-120f-4092-acb2-f2ed66679aec	b1000000-0000-0000-0000-00000000000c	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
550b34cf-8ff8-4cd6-9023-d425ea428350	b1000000-0000-0000-0000-00000000000c	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
82b5bd0e-fe0e-4525-a50a-6c781b59e0bf	b1000000-0000-0000-0000-00000000000d	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
6bb301af-5d42-4362-99bc-efb4f4ee1540	b1000000-0000-0000-0000-00000000000d	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
59281465-fccd-477f-85b1-7e13cc5a2e70	b1000000-0000-0000-0000-00000000000e	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
cebce7ec-d64b-488b-b095-f775795cfd2e	b1000000-0000-0000-0000-00000000000e	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
5f9a86b7-57fd-4333-b6cc-acf8d48d90a4	b1000000-0000-0000-0000-00000000000f	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
ec93f730-739e-4263-8f43-2bb87195c6a0	b1000000-0000-0000-0000-00000000000f	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
8895dec3-ac25-4289-b16a-a4e2e29fa24a	b1000000-0000-0000-0000-000000000010	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
86e96663-c5a9-4b10-8d6e-0e53ef37c6a3	b1000000-0000-0000-0000-000000000010	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
87be9377-58d0-421e-8234-045d12b9f3cb	b1000000-0000-0000-0000-000000000011	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
35217012-f685-475d-a9a8-915a8a628727	b1000000-0000-0000-0000-000000000011	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
b44e2db6-3e72-4079-b370-6b1aa1c55cd6	b1000000-0000-0000-0000-000000000012	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
7813b927-d55c-4f0f-bd97-6c9b97cbaf17	b1000000-0000-0000-0000-000000000012	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
0fb8b78b-ef01-465a-98f0-b323d79e84b0	b1000000-0000-0000-0000-000000000013	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
47184424-6af2-497d-b482-c84ec0dc998f	b1000000-0000-0000-0000-000000000013	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
fdeb88fb-2231-4112-8d35-c65ef9ef4ecc	b1000000-0000-0000-0000-000000000014	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
3960808a-305e-4a2c-a5f1-b08ee42f41e2	b1000000-0000-0000-0000-000000000014	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
8db8140f-f06d-4919-817d-aa9597f665ef	b1000000-0000-0000-0000-000000000015	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
9c496fef-96ad-4052-8d7e-e6b0dc71ac62	b1000000-0000-0000-0000-000000000015	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
72887d5a-19de-481a-8e90-fc497cb71a07	b1000000-0000-0000-0000-000000000016	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
e309a1dd-6c29-4219-b713-8020dcf24eb7	b1000000-0000-0000-0000-000000000016	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
4f0d5780-c2fd-491c-a7d4-342463d7b116	b1000000-0000-0000-0000-000000000017	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
846f4927-7cb9-4393-b927-2773b23d6853	b1000000-0000-0000-0000-000000000017	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
66700078-4fbc-4edf-b099-d2e0c5983447	b1000000-0000-0000-0000-000000000018	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
420b9262-8fa5-4753-aea8-871a8fb8f62f	b1000000-0000-0000-0000-000000000018	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
0110b19e-74d0-40b0-92fd-280209a70223	b1000000-0000-0000-0000-000000000019	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
a4aa2698-56af-4f4e-852c-0811fa6d7b7a	b1000000-0000-0000-0000-000000000019	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
d2dff783-ac21-4de4-948c-2def30f038ed	b1000000-0000-0000-0000-00000000001a	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
2c70bdfb-ac63-4f0f-8107-5e4925fe3eca	b1000000-0000-0000-0000-00000000001a	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
7a09f2b1-88bb-4aed-91aa-4e566ec94c46	b1000000-0000-0000-0000-00000000001b	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
b2fe7313-7b16-475b-b494-87dda35acbb2	b1000000-0000-0000-0000-00000000001b	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
ba7a49ad-263f-4e54-9c85-4f819e1d2d09	b1000000-0000-0000-0000-00000000001c	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
fa12d5de-dca0-42dd-b99a-c532764555f7	b1000000-0000-0000-0000-00000000001c	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
badd8234-1ce6-4841-9a12-cb7e39f7157a	b1000000-0000-0000-0000-00000000001d	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
5e21a063-11ab-4cfd-8d3c-444d654efe96	b1000000-0000-0000-0000-00000000001d	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
f09520ea-f9a5-431b-9308-d976a64d93a4	b1000000-0000-0000-0000-00000000001e	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
3cf58d91-32ee-406b-83ad-ba324f502b9d	b1000000-0000-0000-0000-00000000001e	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
2202464f-9b11-40ff-8e5b-765d1f6c91d7	b1000000-0000-0000-0000-00000000001f	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
255a1f63-75c1-4f89-bf73-cbf39de93978	b1000000-0000-0000-0000-00000000001f	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
2ae791c7-19d5-4f20-add9-1f8403689380	b1000000-0000-0000-0000-000000000020	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
f59a44fc-0aad-433d-ad33-e57efd287b00	b1000000-0000-0000-0000-000000000020	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
95ab95b7-65cd-4733-9cf2-bc63b32a21de	b1000000-0000-0000-0000-000000000021	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
59591200-2279-4543-88d4-6134a81d85ca	b1000000-0000-0000-0000-000000000021	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
a84bb781-b9df-4cd8-93cb-59ea7d1f3bbd	b1000000-0000-0000-0000-000000000022	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
456c2418-965d-4987-bcb8-62bd08f90dcc	b1000000-0000-0000-0000-000000000022	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
0b62e8b5-1c1b-45bf-966a-b79ae0a75d55	b1000000-0000-0000-0000-000000000023	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
cda468c2-e2b0-4fba-b8e8-d4339f6be46f	b1000000-0000-0000-0000-000000000023	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
77c5473f-231f-4d5c-aadf-206384f12d91	b1000000-0000-0000-0000-000000000024	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
c386d646-1f30-4c01-a835-68e6f401d97a	b1000000-0000-0000-0000-000000000024	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
a27273c8-9412-4871-a03d-64490463b03b	b1000000-0000-0000-0000-000000000025	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
36b245ed-ed70-4ece-87ae-7b9d7445bdfb	b1000000-0000-0000-0000-000000000025	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
e4365d4b-547f-4318-a6b6-ee61de2b876c	b1000000-0000-0000-0000-000000000026	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
4f715e15-904f-42ce-a121-5dbb2a407a0a	b1000000-0000-0000-0000-000000000026	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
c40a4d63-8cfc-4400-a0ba-8501613371f0	b1000000-0000-0000-0000-000000000027	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
4fa53cb5-853d-4a7c-8fb5-9822491026ee	b1000000-0000-0000-0000-000000000027	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
2b9783c9-1b0e-4794-88d2-efe4412854d6	b1000000-0000-0000-0000-000000000028	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
8084f9c9-c049-44e9-a2ec-8e9e579c83e7	b1000000-0000-0000-0000-000000000028	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
69534975-057d-48f7-b00d-2e056a207409	b1000000-0000-0000-0000-000000000029	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
62dcf851-7317-470e-8162-68c77e53c25a	b1000000-0000-0000-0000-000000000029	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
5cd78148-589a-438a-bf2b-3b7e8dcbafc9	b1000000-0000-0000-0000-00000000002a	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
a9d4f76a-b29e-45a2-a511-271d38be9cae	b1000000-0000-0000-0000-00000000002a	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
5e4f86c2-793d-45d8-a7ab-798329e1d33e	b1000000-0000-0000-0000-00000000002b	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
f9dc65b4-a25b-4df0-887f-a27e3c6d49ee	b1000000-0000-0000-0000-00000000002b	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
a8abc025-355d-49cd-bf09-4db25dcc0262	b1000000-0000-0000-0000-00000000002c	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
312e2c95-1bc4-489a-b784-07133910b024	b1000000-0000-0000-0000-00000000002c	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
439141ed-ab1f-4cee-882e-9eaeaaa19cc5	b1000000-0000-0000-0000-00000000002d	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
2bf208b2-b052-40d7-b902-98ad01d9ff91	b1000000-0000-0000-0000-00000000002d	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
00a8409d-c22c-4de5-8348-60df282158d9	b1000000-0000-0000-0000-00000000002e	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
962c8a51-5b8f-4372-af82-800789ab499a	b1000000-0000-0000-0000-00000000002e	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
48e9dc8b-53d5-479e-880c-19ac184a986c	b1000000-0000-0000-0000-00000000002f	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
e89378ae-d573-40f0-9c2a-8f5e30b57b09	b1000000-0000-0000-0000-00000000002f	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
ea10b999-7dec-4eff-8677-84a346e2b81f	b1000000-0000-0000-0000-000000000030	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
9cb495aa-47f8-47ba-b874-9de378742136	b1000000-0000-0000-0000-000000000030	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
416de0a6-35c1-4219-ab11-82d3dc1060a7	b1000000-0000-0000-0000-000000000031	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
dbb1ee34-2ceb-4fc8-aa5c-3bdf32c33d9c	b1000000-0000-0000-0000-000000000031	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
f613d622-f99e-477f-9ed4-b9b0e03b2e99	b1000000-0000-0000-0000-000000000032	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
a3df95b1-fded-4bb8-81ac-efb62b56aa8f	b1000000-0000-0000-0000-000000000032	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
3b167c4c-9b16-48b6-9b9d-6607f77a31e2	b1000000-0000-0000-0000-000000000033	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
e09d5b7c-3ec5-4d45-9696-74731c33079a	b1000000-0000-0000-0000-000000000033	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
bcf9fd03-c4b6-4ca1-8d73-976d7127f8da	b1000000-0000-0000-0000-000000000034	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
53938261-de01-4e02-a4fc-dbcf6049255a	b1000000-0000-0000-0000-000000000034	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
78d2a38b-4867-4ed4-9708-cc1f0d852718	b1000000-0000-0000-0000-000000000035	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
3cacb0fd-f925-4ab0-86eb-35b0b9377374	b1000000-0000-0000-0000-000000000035	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
69d5bb0c-f609-4436-8b33-b1a615de3ee6	b1000000-0000-0000-0000-000000000036	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
c97bb73d-4190-4985-a01d-b2f2895bf50f	b1000000-0000-0000-0000-000000000036	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
ea6b6b61-41cf-4cbb-bf26-a66e0f5736b2	b1000000-0000-0000-0000-000000000037	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
f8b155d8-ce84-4185-b313-d2bc45aa068c	b1000000-0000-0000-0000-000000000037	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
9e84a205-6909-4556-94cf-775a9d9d6250	b1000000-0000-0000-0000-000000000038	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
79121c05-dee7-4ade-8632-37f87092a84c	b1000000-0000-0000-0000-000000000038	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
f9360c84-8d6e-4f7e-9bad-28de14bbcde0	b1000000-0000-0000-0000-000000000039	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
59978f6e-9344-4d5f-af02-6f35c71ab602	b1000000-0000-0000-0000-000000000039	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
58b3d11e-a08c-4651-92f7-63bdf4ea5bd4	b1000000-0000-0000-0000-00000000003a	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
9fdf3185-1d1f-4012-8d23-de820b7dcb0d	b1000000-0000-0000-0000-00000000003a	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
276d6e62-ae67-404a-bf86-e7d142d69467	b1000000-0000-0000-0000-00000000003b	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
26b46361-8c11-466a-bf08-8f471aa2e13a	b1000000-0000-0000-0000-00000000003b	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
e4601db4-1c49-4bdd-bd27-c996e4c97fbe	b1000000-0000-0000-0000-00000000003c	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-01 06:58:06.948824+00
88f653a2-6897-444c-ac97-1b62df18fc5d	b1000000-0000-0000-0000-00000000003c	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-01 06:58:06.948824+00
1ab3dbc2-3141-43cf-8ad9-d60f2c784d94	b1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
1169fdd6-a953-463a-9cfb-0fc38e591e8b	b1000000-0000-0000-0000-000000000002	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
5a057787-7c0e-44ce-be1f-d72e28907482	b1000000-0000-0000-0000-000000000003	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
fea2e785-a669-4488-9223-8f4408ebc84e	b1000000-0000-0000-0000-000000000004	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
46ca2ed1-379a-4081-9ecf-dcc3924ef7d1	b1000000-0000-0000-0000-000000000005	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
2543cc26-1295-42bf-a652-126457fac9e1	b1000000-0000-0000-0000-000000000006	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
70593d9e-7708-4ccf-988b-064f6f7d8953	b1000000-0000-0000-0000-000000000007	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
e6d62061-6fcf-4733-88e0-2f260ca50afe	b1000000-0000-0000-0000-000000000008	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
a6497720-2bb9-44e2-886c-dcfa1695c1fc	b1000000-0000-0000-0000-000000000009	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
1292cddf-4542-4124-b5cb-45fc3bd67933	b1000000-0000-0000-0000-00000000000a	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
26aeb64b-cbc8-4823-9544-14e49b10c422	b1000000-0000-0000-0000-00000000000b	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
4476dcc1-b8d0-4ba5-b5ad-9a31b3bb2a6d	b1000000-0000-0000-0000-00000000000c	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
c9805134-34d8-4d46-a77f-1a9007bd1866	b1000000-0000-0000-0000-00000000000d	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
392788e3-63a4-41cf-a17e-4393b735ad62	b1000000-0000-0000-0000-00000000000e	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
8a8cd45e-cb99-4aa4-825c-87fc1a1c97e0	b1000000-0000-0000-0000-00000000000f	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
1eb8f731-9135-4ae8-834a-136f6bb76b95	b1000000-0000-0000-0000-000000000010	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
96a02671-2b79-4fd5-b4be-98800f61b019	b1000000-0000-0000-0000-000000000011	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
5c891c20-2220-4391-a27e-0756f3d7fb3a	b1000000-0000-0000-0000-000000000012	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
8c07c082-1015-4143-9a55-5e891fb320dd	b1000000-0000-0000-0000-000000000013	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
20b30971-0443-4368-ae2e-2b14b3a3e002	b1000000-0000-0000-0000-000000000014	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
292f20ea-0f53-402b-8f73-554b44536303	b1000000-0000-0000-0000-000000000015	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
a8179681-3604-4584-a772-50aa5f5e48b2	b1000000-0000-0000-0000-000000000016	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
a15943ff-659d-472a-a572-a6489801d8af	b1000000-0000-0000-0000-000000000017	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
573450c4-7a04-4b61-9336-d49b40791ddf	b1000000-0000-0000-0000-000000000018	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
d345bcd1-5a56-4842-92c3-a97f608785d5	b1000000-0000-0000-0000-000000000019	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
66e87ebd-90b8-4555-8d09-62e52e4d00a0	b1000000-0000-0000-0000-00000000001a	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
f4aa60f3-2c61-4caf-a01e-f52e8f3045cc	b1000000-0000-0000-0000-00000000001b	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
43c9dd01-e334-4ddb-ba5d-2c46a49e2084	b1000000-0000-0000-0000-00000000001c	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
98cb34a6-59d7-4445-a7f0-e44b8d87efd3	b1000000-0000-0000-0000-00000000001d	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
7d23bab6-df77-47ab-b501-68e60ccf8047	b1000000-0000-0000-0000-00000000001e	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
e6eaca45-db8e-4181-bea4-bd92a1b67b0c	b1000000-0000-0000-0000-00000000001f	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
5e271195-671b-4875-9740-e0f394303006	b1000000-0000-0000-0000-000000000020	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
e7dd7097-b657-4534-b40f-d1549f080fee	b1000000-0000-0000-0000-000000000021	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
acee5154-1b01-4681-81ef-3fafe1563638	b1000000-0000-0000-0000-000000000022	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
92034c3e-cf85-4c7b-af9b-4faac28660e3	b1000000-0000-0000-0000-000000000023	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
2a9c8d47-4f74-4c98-8f83-54704c847cf3	b1000000-0000-0000-0000-000000000024	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
312c8ab8-e20e-4f90-8b40-c502a666067f	b1000000-0000-0000-0000-000000000025	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
c1beeb66-f65a-4f1c-9d71-17a5621f0c5f	b1000000-0000-0000-0000-000000000026	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
034c782b-9829-4934-ad92-109db42a898d	b1000000-0000-0000-0000-000000000027	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
48bad0d3-0218-49bf-8de6-886783091c36	b1000000-0000-0000-0000-000000000028	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
142c573b-78f7-4692-81ad-48180304f8b8	b1000000-0000-0000-0000-000000000029	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
8c028b79-a6a1-4726-961d-38395fb817d3	b1000000-0000-0000-0000-00000000002a	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
55a16203-fcca-4511-99ee-a998b2d3724f	b1000000-0000-0000-0000-00000000002b	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
998005b6-1b07-44fe-bd2d-4aad3fc3db6c	b1000000-0000-0000-0000-00000000002c	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
871582ec-d532-4457-9b58-93ecafacae10	b1000000-0000-0000-0000-00000000002d	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
1b5c78e4-ff48-4e1a-9259-7f3bb0bf6ced	b1000000-0000-0000-0000-00000000002e	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
7858d781-8399-4c65-85d6-84ce07f3c16b	b1000000-0000-0000-0000-00000000002f	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
8ec2c1fe-e778-412a-afe3-b8f6e4924dcb	b1000000-0000-0000-0000-000000000030	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
19a1e4e8-2cfe-4206-9605-883f59fb2c66	b1000000-0000-0000-0000-000000000031	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
1f88b707-f30d-4ef4-9fbd-86b1b33d67c2	b1000000-0000-0000-0000-000000000032	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
994db074-6ecf-4b4e-a8f3-3e3aede40118	b1000000-0000-0000-0000-000000000033	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
364cbb96-274c-4c8c-b1d9-360598f8505d	b1000000-0000-0000-0000-000000000034	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
2eb42bac-11cc-4e2f-8270-c23091f75c5b	b1000000-0000-0000-0000-000000000035	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
a5b45993-1cd3-46d4-826f-07ff82d6e302	b1000000-0000-0000-0000-000000000036	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
1210ebce-9e7f-4f5d-baf7-36d374356083	b1000000-0000-0000-0000-000000000037	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
9676fee0-ca5a-4a0f-90b6-a3af502b4522	b1000000-0000-0000-0000-000000000038	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
e4582a21-dc65-41fa-b82c-2edbae3849fa	b1000000-0000-0000-0000-000000000039	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
78fdcac6-8a91-49d8-89b8-390c6b633632	b1000000-0000-0000-0000-00000000003a	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
c155723a-4509-44c3-a80b-efa3f3c1a16f	b1000000-0000-0000-0000-00000000003b	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
f5030224-5a2c-47a9-9499-a26e54e038a2	b1000000-0000-0000-0000-00000000003c	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-01 07:09:59.95948+00
978fb1d6-7004-4759-9e9f-694d4a16feae	b1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
4b0b4624-6fee-4767-a030-dfd3911065a9	b1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
39905a68-43b8-4798-95d1-505cd1473785	b1000000-0000-0000-0000-000000000002	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
c8f7952b-5348-4083-b580-56443b435e36	b1000000-0000-0000-0000-000000000002	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
7207a032-631b-4a08-8c5c-86a9ec4929c2	b1000000-0000-0000-0000-000000000003	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
20ed3f43-2c2c-4a84-bd1d-890856c3107b	b1000000-0000-0000-0000-000000000003	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
abbce730-c3bb-4e1a-a728-b0b91c93da7e	b1000000-0000-0000-0000-000000000004	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
a6b7cfcd-2bfc-4aab-a0ed-2089ed69a566	b1000000-0000-0000-0000-000000000004	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
bfcb821b-c740-476a-a027-4869e88e5e51	b1000000-0000-0000-0000-000000000005	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
ae8a68ad-b07d-4937-a456-ff27b8886b33	b1000000-0000-0000-0000-000000000005	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
aeb61a04-d630-4ede-831a-5ad6571a6524	b1000000-0000-0000-0000-000000000006	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
c304e3bc-1865-4fd4-9fdd-2bcc1dfee992	b1000000-0000-0000-0000-000000000006	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
5d867484-81d6-47bb-a09c-3db87e9d571f	b1000000-0000-0000-0000-000000000007	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
74e596c1-0f40-49c2-a767-e70a683ce693	b1000000-0000-0000-0000-000000000007	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
f38ebd67-e9b6-4aa5-b295-ff90d9ddede9	b1000000-0000-0000-0000-000000000008	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
d40dcc5c-aaa5-4b27-8eca-f7a868e2f215	b1000000-0000-0000-0000-000000000008	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
e9009a30-fa01-4da4-8e17-bdc2763209a9	b1000000-0000-0000-0000-000000000009	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
8baed91c-1fce-48a0-846a-b24210fcfa6c	b1000000-0000-0000-0000-000000000009	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
7e0b109a-6f44-4aae-9e72-0816c2dd58b7	b1000000-0000-0000-0000-00000000000a	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
07aca534-38dc-478d-9d59-587aaec4fb32	b1000000-0000-0000-0000-00000000000a	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
7f85517f-3016-42da-96fa-a60f98578ada	b1000000-0000-0000-0000-00000000000b	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
d56e8f6d-0160-43c1-a9e4-21e0151633aa	b1000000-0000-0000-0000-00000000000b	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
460abd9b-f627-43df-953e-569d93844bc3	b1000000-0000-0000-0000-00000000000c	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
dae6e6d3-2209-46f1-97dd-7bd83081a38e	b1000000-0000-0000-0000-00000000000c	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
22b9b517-6ff8-4268-a676-22307f19b031	b1000000-0000-0000-0000-00000000000d	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
6385cf60-8c6f-4242-8088-af5c4dd37f96	b1000000-0000-0000-0000-00000000000d	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
770fbfc2-23cf-4e16-ac3f-ea6679f02fd8	b1000000-0000-0000-0000-00000000000e	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
5c586c24-be2d-4040-b38c-ba45a85cdf96	b1000000-0000-0000-0000-00000000000e	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
28c8a03d-ce42-4dd0-83da-d5f7b4b5edcc	b1000000-0000-0000-0000-00000000000f	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
23d8a135-c609-41fd-9f03-4495dfb36a8f	b1000000-0000-0000-0000-00000000000f	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
7628c78e-9d7b-4eed-8673-a28768765692	b1000000-0000-0000-0000-000000000010	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
0923f75d-9591-404a-9d69-d1b44608e366	b1000000-0000-0000-0000-000000000010	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
3c43c2ff-3ec1-45d8-b133-9ebce55a994f	b1000000-0000-0000-0000-000000000011	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
27e6b146-98b8-402d-b352-ed2781636b1f	b1000000-0000-0000-0000-000000000011	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
ab85551c-cfd2-401c-b401-b4e3ec931093	b1000000-0000-0000-0000-000000000012	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
fd94beab-67db-4ede-99dd-f089725f1987	b1000000-0000-0000-0000-000000000012	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
7005d561-8662-4776-8059-5b408d87f58a	b1000000-0000-0000-0000-000000000013	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
177d6cc9-3172-4696-a7f6-216a112f7a10	b1000000-0000-0000-0000-000000000013	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
d4857537-5b34-483b-a1a3-50bb2e3a6844	b1000000-0000-0000-0000-000000000014	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
b76f5735-1aa7-4070-8ae2-4344482d598f	b1000000-0000-0000-0000-000000000014	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
8f56c028-6324-4dc8-968c-a072c6f8cd6a	b1000000-0000-0000-0000-000000000015	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
67ec18c0-723c-417c-b87f-a8c7bb6b6de6	b1000000-0000-0000-0000-000000000015	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
34e237d8-f81f-4846-b68b-0f96dd9e535a	b1000000-0000-0000-0000-000000000016	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
6959cc1b-543d-49aa-a236-6c578c664507	b1000000-0000-0000-0000-000000000016	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
9390d594-6be2-4dc0-be9c-9e4a5c187434	b1000000-0000-0000-0000-000000000017	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
9e368b5e-559e-41aa-9a0f-398f91fe5484	b1000000-0000-0000-0000-000000000017	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
1f8238fc-7209-49ab-98e3-0070e262f4e8	b1000000-0000-0000-0000-000000000018	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
ef8bd620-994c-4693-abfa-b1d6608183be	b1000000-0000-0000-0000-000000000018	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
4ec3d5d4-166f-4616-ac6b-b5dd626c716b	b1000000-0000-0000-0000-000000000019	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
6ae2df09-e2ae-4085-828b-99b6397ab1a3	b1000000-0000-0000-0000-000000000019	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
26d0be30-68f4-44ae-9efc-8bf5dd325dd6	b1000000-0000-0000-0000-00000000001a	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
ec6eef43-2a1e-417f-a09e-2f4ac18aeaf6	b1000000-0000-0000-0000-00000000001a	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
d986b167-7bd9-4b11-a5b5-5839766bf2ba	b1000000-0000-0000-0000-00000000001b	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
715bd3c8-c15a-4df3-b670-a7dac0013d0a	b1000000-0000-0000-0000-00000000001b	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
755fba04-498e-432a-81d6-3ffb66fab66d	b1000000-0000-0000-0000-00000000001c	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
78047afc-e98f-47b9-8683-fab4daffda11	b1000000-0000-0000-0000-00000000001c	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
016c3541-c1e8-4c4f-94bf-a84703765eb3	b1000000-0000-0000-0000-00000000001d	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
436ee6ba-cf21-4d0e-a20c-08c77219a97b	b1000000-0000-0000-0000-00000000001d	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
e2ea630e-3901-4195-a899-3d9fb85073bb	b1000000-0000-0000-0000-00000000001e	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
cbf57701-2643-4316-b513-5f2a5b929d98	b1000000-0000-0000-0000-00000000001e	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
c132e762-26db-47a4-9f85-07fe8153e8d7	b1000000-0000-0000-0000-00000000001f	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
e2e02ca8-5e09-4cb5-9085-2241b1887b9f	b1000000-0000-0000-0000-00000000001f	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
28f8ba86-bffb-4b4e-afff-c75165b4f2e9	b1000000-0000-0000-0000-000000000020	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
e0cb3618-819b-4317-b465-4b61f841126c	b1000000-0000-0000-0000-000000000020	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
9d42adc5-0cd9-4cb9-a908-14fadeb75a2e	b1000000-0000-0000-0000-000000000021	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
bccc0a54-cb87-4de2-825d-a84e048db973	b1000000-0000-0000-0000-000000000021	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
12bebf20-9847-4b3b-ac35-afb504181040	b1000000-0000-0000-0000-000000000022	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
c2fede9c-537d-4cfe-a814-a81b92e294f2	b1000000-0000-0000-0000-000000000022	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
266e0154-60bc-4f78-a71f-a63866ae1591	b1000000-0000-0000-0000-000000000023	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
61fd8207-2d90-47f6-953f-d46b3cb50ea7	b1000000-0000-0000-0000-000000000023	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
e6216ef5-097f-4644-bda0-4e01331c2821	b1000000-0000-0000-0000-000000000024	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
cbcba1af-a2e3-4657-965c-650e7934ecd2	b1000000-0000-0000-0000-000000000024	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
6e5b6005-41a4-4703-929a-585f0bc069a0	b1000000-0000-0000-0000-000000000025	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
39f30e04-c325-4b9c-b480-2cda7192aa82	b1000000-0000-0000-0000-000000000025	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
7fa74163-e399-4864-a6e9-81c615ec4b26	b1000000-0000-0000-0000-000000000026	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
51a5308a-0779-49ac-bb8e-15f1444484af	b1000000-0000-0000-0000-000000000026	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
a66749a3-df95-4332-b052-a045162b49f9	b1000000-0000-0000-0000-000000000027	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
6e431420-1abb-4703-8d24-b6df0abea626	b1000000-0000-0000-0000-000000000027	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
03e3a680-4533-447d-886e-39f8ca35a19e	b1000000-0000-0000-0000-000000000028	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
35a8e891-364f-4ea5-b867-35f091ffbd8d	b1000000-0000-0000-0000-000000000028	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
c4b62d5e-826e-4223-80ff-12d5dfa698d5	b1000000-0000-0000-0000-000000000029	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
58351035-1a64-43dc-8f42-8c88a94e2401	b1000000-0000-0000-0000-000000000029	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
e649eb3c-956e-4332-817e-613700031bba	b1000000-0000-0000-0000-00000000002a	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
8df0ff1b-2744-4c6b-b05e-d343fed15e22	b1000000-0000-0000-0000-00000000002a	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
597219d8-b79d-46f1-9771-bbe219fdcab4	b1000000-0000-0000-0000-00000000002b	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
5c8da9c7-e169-447b-870a-2a4f8457efa6	b1000000-0000-0000-0000-00000000002b	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
226aca6a-1f65-48f3-ae6f-bb680e46b1af	b1000000-0000-0000-0000-00000000002c	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
a8bb1110-a738-45fe-850c-5bf838bc525b	b1000000-0000-0000-0000-00000000002c	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
302fb3d5-8c25-4f10-8676-e28141f2c6cc	b1000000-0000-0000-0000-00000000002d	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
e6290e69-4559-428f-af3f-8363f8629ca6	b1000000-0000-0000-0000-00000000002d	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
8f7e2a82-8187-46a3-8a03-a49dd9d91866	b1000000-0000-0000-0000-00000000002e	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
8ddf5ab9-c243-4c05-b924-ed57dd1da5ac	b1000000-0000-0000-0000-00000000002e	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
cf926f56-f9e7-45c2-8486-3f8dc7a2580d	b1000000-0000-0000-0000-00000000002f	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
676dedd7-bd48-4576-b883-e01a0d62b360	b1000000-0000-0000-0000-00000000002f	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
20e73def-3a97-4cc0-9dac-6e97fa689462	b1000000-0000-0000-0000-000000000030	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
93547df2-6370-4a7f-84a3-6ba6126d5e82	b1000000-0000-0000-0000-000000000030	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
7afa0b96-54dc-4506-bf60-6aed0a17e39b	b1000000-0000-0000-0000-000000000031	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
83bc3702-95a6-44c0-b52b-bf7e62e322d6	b1000000-0000-0000-0000-000000000031	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
0923af0f-ea06-4750-9b66-8e11e535dec4	b1000000-0000-0000-0000-000000000032	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
f20c0c92-a3e1-4f3f-b5de-477e69fdcf65	b1000000-0000-0000-0000-000000000032	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
31ebdd06-ed12-4208-8e09-d84306d93b36	b1000000-0000-0000-0000-000000000033	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
bcfd2a43-ffbf-4d3b-b7c5-aed1031be437	b1000000-0000-0000-0000-000000000033	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
cfe74636-0ece-4d95-bf33-eec15e581ffd	b1000000-0000-0000-0000-000000000034	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
ea11fa8f-c7ae-4f99-87ee-07aced54200f	b1000000-0000-0000-0000-000000000034	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
4a3dd816-e1ce-4b77-b230-f4489e0909be	b1000000-0000-0000-0000-000000000035	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
90f1f7fe-2e47-4034-9a3a-6a34693f3aac	b1000000-0000-0000-0000-000000000035	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
c8bcee32-1e92-4d36-bcfa-65c75b39aacd	b1000000-0000-0000-0000-000000000036	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
67052df4-85c1-49c8-bc26-7b8e879a3941	b1000000-0000-0000-0000-000000000036	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
b52d9ae1-90c8-4db7-a689-b09784295e74	b1000000-0000-0000-0000-000000000037	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
2f7ba0fc-45e8-4ad3-bfac-f4357c29b345	b1000000-0000-0000-0000-000000000037	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
d391ea17-b740-45e6-9803-902e1d2050b7	b1000000-0000-0000-0000-000000000038	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
97c27b32-9cad-4b8d-8553-1f2475a5d70b	b1000000-0000-0000-0000-000000000038	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
582f9c25-3a08-4275-86d2-448c225f2bcd	b1000000-0000-0000-0000-000000000039	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
84abef18-8eb9-4dcc-af4d-5fc947a1274d	b1000000-0000-0000-0000-000000000039	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
a62bc4b0-895e-402c-b9c5-2abd81b76377	b1000000-0000-0000-0000-00000000003a	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
fc3fb218-e872-45c1-932a-24a257b08f43	b1000000-0000-0000-0000-00000000003a	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
f9727e01-6380-45aa-a785-142e6bcc9bc4	b1000000-0000-0000-0000-00000000003b	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
62b368a4-f8ef-448e-bf86-82b5ecbcbaa7	b1000000-0000-0000-0000-00000000003b	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
01f48e91-2988-472d-b32d-3debc379d84e	b1000000-0000-0000-0000-00000000003c	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-01 07:09:59.964688+00
19918532-43cb-4f8f-bf25-b066827dffc3	b1000000-0000-0000-0000-00000000003c	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-01 07:09:59.964688+00
fdaf16b7-092e-4970-9a13-bb9f365a47b5	5c97d67f-76f8-464b-9bf5-ae98f5752095	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-03 10:23:27.116252+00
01a6fce0-8e53-4fbb-a4f1-8e18bc02e105	5c97d67f-76f8-464b-9bf5-ae98f5752095	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-03 10:23:27.116252+00
413abe0a-087a-473a-9189-58eafc18675d	b1000000-0000-0000-0000-00000000003d	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-03 10:23:27.116252+00
ff5ee6b8-0a46-45fd-91c5-f8c1416f861b	b1000000-0000-0000-0000-00000000003d	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-03 10:23:27.116252+00
79724ed7-2b52-4db2-94d3-1b79c5cb184b	b1000000-0000-0000-0000-00000000003e	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-03 10:23:27.116252+00
e9a22f6c-2784-4039-a848-034faa99a8aa	b1000000-0000-0000-0000-00000000003e	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-03 10:23:27.116252+00
2eb59b4c-9276-40f9-8b49-a48eb21a7901	b1000000-0000-0000-0000-00000000003f	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-03 10:23:27.116252+00
2ccfec18-4504-4cb2-ba9d-51cc22c75103	b1000000-0000-0000-0000-00000000003f	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-03 10:23:27.116252+00
f511dbeb-d4ce-4a0d-9e5a-1afd7f19deba	b1000000-0000-0000-0000-000000000040	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-03 10:23:27.116252+00
accd0348-70f6-4e98-99cb-b5e20486c35c	b1000000-0000-0000-0000-000000000040	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-03 10:23:27.116252+00
dffe36aa-dcc7-4b70-a963-6b2626d32162	b1000000-0000-0000-0000-000000000041	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-03 10:23:27.116252+00
4d6262f2-b5e6-46ea-bb82-8f14be8ba4f9	b1000000-0000-0000-0000-000000000041	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-03 10:23:27.116252+00
a598a3f3-e1d1-4a56-9292-9e2215c80c7a	b1000000-0000-0000-0000-000000000042	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-03 10:23:27.116252+00
52ea9d96-09a1-4adb-8699-c1e5c5b7630a	b1000000-0000-0000-0000-000000000042	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-03 10:23:27.116252+00
4ca928fe-6358-41b8-a60a-6b8f100ca62c	b1000000-0000-0000-0000-000000000043	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-03 10:23:27.116252+00
d621823b-1d27-43dd-a797-c990932dc3d5	b1000000-0000-0000-0000-000000000043	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-03 10:23:27.116252+00
a0accac1-972e-47c0-afd3-e5537697123e	b1000000-0000-0000-0000-000000000044	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-03 10:23:27.116252+00
10faae6c-e05f-42ff-a100-cedd2cd37546	b1000000-0000-0000-0000-000000000044	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-03 10:23:27.116252+00
24dabd98-2c65-4732-a2e4-c22a1e8ece2c	b1000000-0000-0000-0000-000000000045	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-03 10:23:27.116252+00
f60f9517-7c23-4f24-8972-b14dab6e689d	b1000000-0000-0000-0000-000000000045	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-03 10:23:27.116252+00
28d0920a-dee3-4054-a927-e1835b141ea6	b1000000-0000-0000-0000-000000000046	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-03 10:23:27.116252+00
e4d95795-77d2-469d-85e4-d748259d1679	b1000000-0000-0000-0000-000000000046	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-03 10:23:27.116252+00
b3331666-59c9-4554-96bc-436d25a2e153	5c97d67f-76f8-464b-9bf5-ae98f5752095	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-03 10:23:27.124795+00
5c3a1a72-a779-475c-9789-91a4263f3a7c	b1000000-0000-0000-0000-00000000003d	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-03 10:23:27.124795+00
dba51ead-d79e-465f-84d7-3e2fc6478ba5	b1000000-0000-0000-0000-00000000003e	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-03 10:23:27.124795+00
0148e65d-9b83-4080-96a2-ea357a115e4f	b1000000-0000-0000-0000-00000000003f	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-03 10:23:27.124795+00
34555b19-095b-4419-8056-88489030ac7b	b1000000-0000-0000-0000-000000000040	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-03 10:23:27.124795+00
4edee40a-ae8e-4263-a65d-3ef7c886bf5c	b1000000-0000-0000-0000-000000000041	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-03 10:23:27.124795+00
d0dce712-e279-42f9-ba81-3c0cf0cc5817	b1000000-0000-0000-0000-000000000042	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-03 10:23:27.124795+00
0b08cb57-04a5-450f-a663-90efd84bb41f	b1000000-0000-0000-0000-000000000043	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-03 10:23:27.124795+00
5196d941-f5e8-48a8-976e-c7a0c2e1f9a3	b1000000-0000-0000-0000-000000000044	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-03 10:23:27.124795+00
0e2855f8-9e2a-47d6-aa86-e69c52c5afed	b1000000-0000-0000-0000-000000000045	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-03 10:23:27.124795+00
3f753d68-f30f-43c0-963c-d636ecbe357b	b1000000-0000-0000-0000-000000000046	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-03 10:23:27.124795+00
3fdfa03e-552e-4185-8ab1-74dc28b9784f	5c97d67f-76f8-464b-9bf5-ae98f5752095	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-03 10:23:27.126967+00
6fb3db93-b8de-4d35-931d-eb26987e5781	5c97d67f-76f8-464b-9bf5-ae98f5752095	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-03 10:23:27.126967+00
8f473d6f-cb9a-473c-bb0e-a2d808a20c45	b1000000-0000-0000-0000-00000000003d	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-03 10:23:27.126967+00
2ffa2f87-33dc-4128-9b08-15e6f31634b1	b1000000-0000-0000-0000-00000000003d	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-03 10:23:27.126967+00
27fb58d4-2a6e-4639-9461-099c93b79256	b1000000-0000-0000-0000-00000000003e	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-03 10:23:27.126967+00
10d4e327-b6bd-468e-98c6-057a4396124d	b1000000-0000-0000-0000-00000000003e	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-03 10:23:27.126967+00
9b8d0857-a126-457f-9dfe-3d0d47c97241	b1000000-0000-0000-0000-00000000003f	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-03 10:23:27.126967+00
467c226d-0ce8-47b2-bf4c-84ecffcb86b2	b1000000-0000-0000-0000-00000000003f	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-03 10:23:27.126967+00
97c5a599-2d1c-4898-90a1-f8729b41335d	b1000000-0000-0000-0000-000000000040	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-03 10:23:27.126967+00
cdaa7294-3c23-49cf-a270-cb7ecc24e1c8	b1000000-0000-0000-0000-000000000040	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-03 10:23:27.126967+00
7fca7ca4-5179-45c7-b033-fdc31e80c663	b1000000-0000-0000-0000-000000000041	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-03 10:23:27.126967+00
2fe04ea2-e4e0-4024-899a-223d3c96e78d	b1000000-0000-0000-0000-000000000041	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-03 10:23:27.126967+00
b66abd53-e0bf-4703-8a62-e28b8d860885	b1000000-0000-0000-0000-000000000042	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-03 10:23:27.126967+00
86d89bea-8b8c-4efd-bfa4-876ab4b4c276	b1000000-0000-0000-0000-000000000042	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-03 10:23:27.126967+00
37b366e2-4361-49e5-b810-c03e68102501	b1000000-0000-0000-0000-000000000043	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-03 10:23:27.126967+00
bbee285b-6a17-478c-9430-9b40d080c980	b1000000-0000-0000-0000-000000000043	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-03 10:23:27.126967+00
d0449d2a-e241-4fa7-a820-c2b6900e63c6	b1000000-0000-0000-0000-000000000044	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-03 10:23:27.126967+00
c05320f5-6630-42b8-9ad4-37ff16ec890e	b1000000-0000-0000-0000-000000000044	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-03 10:23:27.126967+00
8c914e8b-f486-417c-8a37-ecc1ec002381	b1000000-0000-0000-0000-000000000045	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-03 10:23:27.126967+00
ac7365ae-8ff4-402e-b10c-897965b0896b	b1000000-0000-0000-0000-000000000045	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-03 10:23:27.126967+00
af332fd0-3014-4e30-bc13-b49efdfb7b57	b1000000-0000-0000-0000-000000000046	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-03 10:23:27.126967+00
f341031a-172a-4c78-8280-2296f131179b	b1000000-0000-0000-0000-000000000046	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-03 10:23:27.126967+00
d839ef7f-4ddd-4094-b85e-1ee7abbdadee	b1000000-0000-0000-0000-000000000005	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
af125916-811c-4dd0-910e-656c2072b129	b1000000-0000-0000-0000-00000000000e	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
2b88b0f0-4670-4218-b63e-1b4252a19d5d	b1000000-0000-0000-0000-00000000001f	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
fedbad68-fbdd-4fc7-aa3d-2249d84288ad	b1000000-0000-0000-0000-000000000021	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
7c400581-56df-4211-b1ba-1d2b70f906f8	b1000000-0000-0000-0000-000000000017	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
0c9d1399-0adb-4146-963b-fd7cda7599cb	b1000000-0000-0000-0000-000000000023	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
234b1c4f-edaa-471f-8aee-fbfe1c756409	b1000000-0000-0000-0000-000000000024	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
40d68be6-aefa-4f3b-aacf-4259b0642194	b1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
b24c23a8-9c8a-4ee0-8639-0efbcf929f3a	b1000000-0000-0000-0000-000000000003	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
40f55996-f467-4ccc-accc-64b36823cee8	b1000000-0000-0000-0000-000000000004	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
114e8abc-7b52-4138-922f-d67a3c63dc7f	b1000000-0000-0000-0000-000000000006	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
2a64dd65-e4a1-4c66-a17c-e95ae20526ba	b1000000-0000-0000-0000-000000000007	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
a4e4767d-2ece-451e-88f9-9490903e5d3b	b1000000-0000-0000-0000-000000000008	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
5492f08b-858d-4b12-b7c0-d69b50af9f00	b1000000-0000-0000-0000-000000000009	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
0c9bd047-d68d-467f-bf1c-918364b6d909	b1000000-0000-0000-0000-00000000000a	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
93324622-4b89-447d-9929-d4f991e948c0	b1000000-0000-0000-0000-000000000030	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
2121af71-22dd-4a01-8d66-72b6db2b6b13	b1000000-0000-0000-0000-00000000002b	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
4408bbf9-110b-49d5-b5c7-bb84dba761b4	b1000000-0000-0000-0000-000000000034	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
4926983e-3c84-42bf-8c87-7e456858e429	b1000000-0000-0000-0000-000000000039	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
2633bf5a-c48e-404d-937b-7e7879f08b04	b1000000-0000-0000-0000-00000000000b	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
5b94b3e1-2ed7-49bd-8147-9a4fc5674555	b1000000-0000-0000-0000-00000000000c	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
b67baeda-26f9-456f-9e55-3dda178c5480	b1000000-0000-0000-0000-00000000000d	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
ff629886-7cdf-41f0-ab10-b79708638fb0	b1000000-0000-0000-0000-000000000015	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
5fd7f62b-8136-4c11-8254-6b0d162b623a	b1000000-0000-0000-0000-000000000002	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
e7f8927d-55e2-4f61-b11c-9d4301918f9c	b1000000-0000-0000-0000-00000000000f	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
a266440f-cce4-467d-a68d-1d50ae17236d	b1000000-0000-0000-0000-000000000010	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
222631e0-9acc-4cc0-9174-01f93fdcd241	b1000000-0000-0000-0000-000000000012	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
f2d395a8-d27d-4230-b523-a341f87b655b	b1000000-0000-0000-0000-000000000011	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
21db1fbb-3a93-43db-b977-21bceeaa38f1	b1000000-0000-0000-0000-000000000013	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
9381e90b-ee57-4c54-a688-6836ca148a8b	b1000000-0000-0000-0000-000000000018	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
9ef5cf1d-acbc-41ee-aee5-3abf3fd2be94	b1000000-0000-0000-0000-000000000019	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
24f00682-a128-4454-ba04-cca38cafb2cc	b1000000-0000-0000-0000-00000000001a	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
5c491aa5-b68e-43e6-b0d0-fd11e91b3c07	b1000000-0000-0000-0000-00000000001b	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
249307f4-42d1-47fb-9a10-7f693beb645f	5c97d67f-76f8-464b-9bf5-ae98f5752095	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
8fdfe908-42cf-4c0f-bccf-501370817a49	b1000000-0000-0000-0000-000000000020	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
4d48abb5-0bc4-4ace-85b6-e0318f077dd0	b1000000-0000-0000-0000-000000000025	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
0de4d8bc-b0c3-47db-af96-5f0114351ab6	b1000000-0000-0000-0000-000000000026	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
a1540b9d-9916-4429-9897-553892bb9bd1	b1000000-0000-0000-0000-00000000002c	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
f475022c-ea6f-482f-9817-0d13d87cd344	b1000000-0000-0000-0000-00000000002d	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
0303d155-7b94-4822-b182-15fc6af960bc	b1000000-0000-0000-0000-000000000014	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
55126315-c92c-4bf6-848a-27202fb17b6c	b1000000-0000-0000-0000-000000000027	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
5c451454-9e0b-4c00-9deb-c54b8a1c11e0	b1000000-0000-0000-0000-000000000028	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
8155d7f5-4a36-4fda-a066-b42319386a45	b1000000-0000-0000-0000-000000000029	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
2ce20cd4-0e36-4855-ae4b-809935753d8d	b1000000-0000-0000-0000-00000000003d	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
03942023-a4e8-44aa-91eb-988b70da69ab	b1000000-0000-0000-0000-00000000003e	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
c3ecb2b0-325c-41d3-81ac-609e1ced66c0	b1000000-0000-0000-0000-00000000003f	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
bef857c0-deef-4dec-bf6e-8819b2046036	b1000000-0000-0000-0000-000000000036	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
2c140585-aa52-4c31-870d-db0998cbeb96	b1000000-0000-0000-0000-000000000040	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
b32dfddf-e6cd-489a-8b90-ad140b3c9fa3	b1000000-0000-0000-0000-000000000041	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
784b6e6b-c125-47d7-99de-7a9bf9b811f4	b1000000-0000-0000-0000-000000000042	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
cf8b1fc8-6dc5-4675-97ce-a2154f98abe3	b1000000-0000-0000-0000-000000000043	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
1d0c00e5-a229-4ec2-9534-b921485e212d	b1000000-0000-0000-0000-000000000044	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
3aec32ac-20b6-440e-9053-862e8cef2e10	b1000000-0000-0000-0000-000000000045	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
1e2d66eb-2b8b-4be2-817a-9bb85a48549a	b1000000-0000-0000-0000-00000000002f	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
1e5ff247-af03-4080-8666-717de96289cd	b1000000-0000-0000-0000-000000000031	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
1a739476-4348-46ec-aeb1-b555deed7b54	b1000000-0000-0000-0000-000000000032	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
a9785db0-da45-48ba-8044-9aba3adecbb9	b1000000-0000-0000-0000-000000000035	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
ca9e48d1-9a58-4cdb-83b8-22ad7b5d7c71	b1000000-0000-0000-0000-000000000046	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
4425b931-e8d5-4bcf-a9c9-537f9090539f	b1000000-0000-0000-0000-000000000038	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
86a895a2-aac7-4f25-a95e-f588144daf00	b1000000-0000-0000-0000-000000000016	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
6563165a-52ab-4931-9d5d-eb8ac52b468c	b1000000-0000-0000-0000-00000000001e	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
823e6805-a451-437b-8a35-5b8a6b337315	b1000000-0000-0000-0000-00000000001c	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
bdc70c1f-1ae0-4184-8d46-2b12790d0833	b1000000-0000-0000-0000-00000000001d	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
78f2cbf8-919a-4e9f-b758-22a1a9c8d4c4	b1000000-0000-0000-0000-000000000037	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
526b5ce5-abbe-434d-a7f3-3d9532de0b10	b1000000-0000-0000-0000-000000000022	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
e425c5e0-2f84-4631-84f2-5dd734742625	b1000000-0000-0000-0000-00000000002a	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
e2c4023c-d7ff-4412-a67d-643c3a1da526	b1000000-0000-0000-0000-00000000002e	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
abb489b8-2acd-47c0-b7be-e25951b7c519	b1000000-0000-0000-0000-000000000033	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
5f079259-afb8-4b28-9c30-babb65e41e31	b1000000-0000-0000-0000-00000000003b	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
53fc725a-146a-4deb-9779-df453f4e6890	b1000000-0000-0000-0000-00000000003a	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
d54a477a-6f5f-40e0-b80e-bafe8e89d335	b1000000-0000-0000-0000-00000000003c	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 10:23:27.178126+00
86dcf8a7-f410-4fde-8a73-f8810885d2e4	d862c38d-38e7-4bec-9c65-05cb39dd54c4	c1000000-0000-0000-0000-000000000001	DELEGATION_LEADER	\N	2026-03-03 18:25:29.351092+00
da1dcdb0-ab4e-4355-a422-c7fa86d20a06	d862c38d-38e7-4bec-9c65-05cb39dd54c4	c1000000-0000-0000-0000-000000000002	MEMBER	\N	2026-03-03 18:25:29.351092+00
ca0aa654-31cb-4ebc-83a5-c1c3bd025f9a	d862c38d-38e7-4bec-9c65-05cb39dd54c4	c1000000-0000-0000-0000-000000000004	MEMBER	\N	2026-03-03 18:25:29.358083+00
8ab192ac-5e2e-4fae-8c24-b51924cfa752	d862c38d-38e7-4bec-9c65-05cb39dd54c4	c1000000-0000-0000-0000-000000000005	OBSERVER	\N	2026-03-03 18:25:29.358083+00
0e9bdbef-bb7b-4280-9a0b-915d95c187a8	d862c38d-38e7-4bec-9c65-05cb39dd54c4	c1000000-0000-0000-0000-000000000000	DELEGATION_LEADER	\N	2026-03-03 18:25:29.444847+00
eb60abc2-9a8c-4a08-9eff-cdd50e59a7a5	d862c38d-38e7-4bec-9c65-05cb39dd54c4	c1000000-0000-0000-0000-000000000006	DELEGATION_LEADER	\N	2026-03-03 18:28:53.068497+00
367a86a9-3381-459d-9206-561b8180547a	d862c38d-38e7-4bec-9c65-05cb39dd54c4	c1000000-0000-0000-0000-000000000003	OBSERVER	\N	2026-03-08 12:11:46.341702+00
\.


--
-- Data for Name: meeting_status_history; Type: TABLE DATA; Schema: core; Owner: isep_app
--

COPY core.meeting_status_history (entry_id, meeting_id, from_status, to_status, changed_by, changed_at, notes) FROM stdin;
a1bf9461-8935-419e-aad9-14908a6d06fd	b1000000-0000-0000-0000-000000000001	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-01-14 10:00:00+00	Session opened.
0e553e79-d529-443b-8b4f-1260d0de8bb8	b1000000-0000-0000-0000-000000000001	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-01-24 20:00:00+00	Session closed.
f42ee838-096b-4f7f-a932-6448b1f4811a	b1000000-0000-0000-0000-000000000002	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-01-21 10:00:00+00	Session opened.
ba2385d8-f3c4-47cf-9905-557657cbb52a	b1000000-0000-0000-0000-000000000002	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-01-26 20:00:00+00	Session closed.
cdda7741-9cc8-45c0-8301-66f8284058f5	b1000000-0000-0000-0000-000000000003	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-02-04 10:00:00+00	Session opened.
7e4a9f55-450d-468d-bed6-5af203bd925f	b1000000-0000-0000-0000-000000000003	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-02-09 20:00:00+00	Session closed.
01d2415d-d91f-4bab-bdd1-0fbed29fe670	b1000000-0000-0000-0000-000000000004	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-02-18 10:00:00+00	Session opened.
aa1338c5-d422-4eee-b5dc-56098bc645ee	b1000000-0000-0000-0000-000000000004	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-02-23 20:00:00+00	Session closed.
3c23f110-4976-4a7f-916b-7cf26201473f	b1000000-0000-0000-0000-000000000005	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-02-25 10:00:00+00	Session opened.
0f4d85c7-62cb-4aae-8a9e-5979492ac8b3	b1000000-0000-0000-0000-000000000005	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-03-01 20:00:00+00	Session closed.
23aeb2ce-9725-4376-9fdb-bad5c27e440e	b1000000-0000-0000-0000-000000000006	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-03-03 10:00:00+00	Session opened.
97e9fea6-d830-4153-bb69-e2bc8c9c3f4e	b1000000-0000-0000-0000-000000000006	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-03-08 20:00:00+00	Session closed.
3f3e5f3f-dd54-4ffd-9f9d-f1d6a1e2c472	b1000000-0000-0000-0000-000000000007	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-03-10 10:00:00+00	Session opened.
833f7736-7033-4825-8c8a-9a87e8e39c23	b1000000-0000-0000-0000-000000000007	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-03-15 20:00:00+00	Session closed.
c62d12b2-6651-44b8-8a66-9b0fe6cc384f	b1000000-0000-0000-0000-000000000008	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-03-17 10:00:00+00	Session opened.
e836ea0d-7325-41eb-ac9e-8f992875e582	b1000000-0000-0000-0000-000000000008	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-03-22 20:00:00+00	Session closed.
f099e028-8f44-4b27-8006-949b2512c672	b1000000-0000-0000-0000-000000000009	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-03-31 10:00:00+00	Session opened.
b68ca093-f403-43d4-a779-86a35bc70dd9	b1000000-0000-0000-0000-000000000009	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-04-05 20:00:00+00	Session closed.
e142807c-1b6c-4529-995f-41ab32029a75	b1000000-0000-0000-0000-00000000000a	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-04-07 10:00:00+00	Session opened.
940ca103-47b0-4e3c-8b72-bc5535886c5a	b1000000-0000-0000-0000-00000000000a	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-04-12 20:00:00+00	Session closed.
f0a2fd78-15ab-4d5b-8ede-1f2f91ce90d8	b1000000-0000-0000-0000-00000000000b	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-04-21 10:00:00+00	Session opened.
247bc9f9-ac4f-4864-9b2b-69ece45975c8	b1000000-0000-0000-0000-00000000000b	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-04-26 20:00:00+00	Session closed.
998034ed-4116-4a8e-bc06-3bf79dc6dcbe	b1000000-0000-0000-0000-00000000000c	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-05-12 10:00:00+00	Session opened.
8ad7e22e-c64f-4791-96c3-1d98f42fed97	b1000000-0000-0000-0000-00000000000c	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-05-22 20:00:00+00	Session closed.
ddadf39b-9638-495c-8b41-145e9f569514	b1000000-0000-0000-0000-00000000000d	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-05-19 10:00:00+00	Session opened.
8b9262e2-a116-4925-bdb8-7ea0724f65cc	b1000000-0000-0000-0000-00000000000d	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-05-24 20:00:00+00	Session closed.
a925ebb0-7a65-4918-80b6-2be3e695a803	b1000000-0000-0000-0000-00000000000e	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-06-02 10:00:00+00	Session opened.
9b1fa752-2e05-47b5-84b3-aad6f6afd22b	b1000000-0000-0000-0000-00000000000e	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-06-07 20:00:00+00	Session closed.
aaf0d39e-7e26-48c2-860b-93858b6c473a	b1000000-0000-0000-0000-00000000000f	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-06-16 10:00:00+00	Session opened.
cfe241a5-6ba5-409d-9973-4c3542ded858	b1000000-0000-0000-0000-00000000000f	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-06-21 20:00:00+00	Session closed.
35f0cb92-c0f2-4b94-a5c8-a704cdb98708	b1000000-0000-0000-0000-000000000010	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-06-30 10:00:00+00	Session opened.
04e881a0-9ef9-4092-823d-6693b32494c8	b1000000-0000-0000-0000-000000000010	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-07-05 20:00:00+00	Session closed.
a65d1e5f-8353-4757-980e-7563538deb2d	b1000000-0000-0000-0000-000000000011	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-07-14 10:00:00+00	Session opened.
f293bc69-4c0c-4d85-91f2-68de0a21bbf5	b1000000-0000-0000-0000-000000000011	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-07-19 20:00:00+00	Session closed.
3583f512-c717-4dc5-805a-eba5fced623b	b1000000-0000-0000-0000-000000000012	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-07-21 10:00:00+00	Session opened.
739a3e2f-c58d-4e2e-aab8-0ebf59cc4b99	b1000000-0000-0000-0000-000000000012	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-07-26 20:00:00+00	Session closed.
16f9fbc0-3960-4283-8518-e4d411f976f4	b1000000-0000-0000-0000-000000000013	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-08-04 10:00:00+00	Session opened.
472940f1-c982-4d71-86f7-95ffc9a3ece7	b1000000-0000-0000-0000-000000000013	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-08-09 20:00:00+00	Session closed.
073dd483-5f68-4b20-9073-f535cc4019b6	b1000000-0000-0000-0000-000000000014	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-08-18 10:00:00+00	Session opened.
6c7ffcd1-e13b-440c-bc6e-4e62f52bc358	b1000000-0000-0000-0000-000000000014	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-08-23 20:00:00+00	Session closed.
c9dc05ed-2a54-4b13-8ce3-23713eda64d1	b1000000-0000-0000-0000-000000000015	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-09-01 10:00:00+00	Session opened.
2371ce6d-80d4-432c-8572-10f0bc48dbbb	b1000000-0000-0000-0000-000000000015	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-09-06 20:00:00+00	Session closed.
6998c79a-08cf-4f08-9d66-c0a66e2b9376	b1000000-0000-0000-0000-000000000016	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-09-15 10:00:00+00	Session opened.
86ed776d-b376-4e7a-9d1c-241c3bea07e5	b1000000-0000-0000-0000-000000000016	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-09-25 20:00:00+00	Session closed.
f902eb08-9a88-450c-91bf-d514b57060d9	b1000000-0000-0000-0000-000000000017	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-09-22 10:00:00+00	Session opened.
859598c1-a737-4c06-b293-ebd6006c65cf	b1000000-0000-0000-0000-000000000017	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-09-27 20:00:00+00	Session closed.
728fb630-99bd-468f-9646-a44c53a8c389	b1000000-0000-0000-0000-000000000018	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-10-06 10:00:00+00	Session opened.
5e05a307-3e03-4347-a00d-3a17e295e810	b1000000-0000-0000-0000-000000000018	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-10-11 20:00:00+00	Session closed.
3529e4de-8501-416e-954e-86ece671ffea	b1000000-0000-0000-0000-000000000019	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-10-20 10:00:00+00	Session opened.
37511303-1bfa-4434-8226-5a79d3749f17	b1000000-0000-0000-0000-000000000019	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-10-25 20:00:00+00	Session closed.
dad0deeb-9297-4979-bd7e-561c93a866be	b1000000-0000-0000-0000-00000000001a	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-11-03 10:00:00+00	Session opened.
37c31716-cf78-4af5-89e3-bc15d1ee2934	b1000000-0000-0000-0000-00000000001a	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-11-08 20:00:00+00	Session closed.
a7cb9832-3875-4018-a7ee-77ba185fcd84	b1000000-0000-0000-0000-00000000001b	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-11-17 10:00:00+00	Session opened.
79f5e491-d1f7-4e44-be75-f2eeb8ceb564	b1000000-0000-0000-0000-00000000001b	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-12-06 20:00:00+00	Session closed.
3c3a709b-a9bc-484e-9f33-e421faec714d	b1000000-0000-0000-0000-00000000001e	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-12-01 10:00:00+00	Session opened.
a844ed37-7a47-46f0-9559-bb2cc9dc4d27	b1000000-0000-0000-0000-00000000001e	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-12-06 20:00:00+00	Session closed.
77a11857-25b7-444e-be08-7c35a7cdb4e4	b1000000-0000-0000-0000-00000000001c	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-12-08 10:00:00+00	Session opened.
a4f22e15-7f73-4244-8e6c-0185d0ff1686	b1000000-0000-0000-0000-00000000001c	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-12-13 20:00:00+00	Session closed.
7e6bfb27-d034-494c-a271-2a689d29e7f7	b1000000-0000-0000-0000-00000000001d	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2024-12-15 10:00:00+00	Session opened.
913e58b4-a556-4d9c-8f6a-41b48482b150	b1000000-0000-0000-0000-00000000001d	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2024-12-20 20:00:00+00	Session closed.
16606b0d-ecd6-41f2-b239-50e928fe785e	b1000000-0000-0000-0000-00000000001f	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-01-12 10:00:00+00	Session opened.
f82b2538-5e3d-4c94-b271-b91219d2567e	b1000000-0000-0000-0000-00000000001f	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-01-22 20:00:00+00	Session closed.
6ae6397f-c806-415b-9151-8e0cb15e9071	b1000000-0000-0000-0000-000000000020	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-01-19 10:00:00+00	Session opened.
a001d24b-cb35-4afa-8a2d-9ba64a2c86ec	b1000000-0000-0000-0000-000000000020	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-01-24 20:00:00+00	Session closed.
b69aef0c-f570-4b7f-86af-313264319aa9	b1000000-0000-0000-0000-000000000021	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-02-02 10:00:00+00	Session opened.
d4e86a8e-46f1-4715-a86b-c25a070e85ce	b1000000-0000-0000-0000-000000000021	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-02-07 20:00:00+00	Session closed.
1c58498d-ffda-4670-bc67-bd4de593712e	b1000000-0000-0000-0000-000000000022	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-02-09 10:00:00+00	Session opened.
6e58d59c-7e95-4889-98dc-e7a950992a41	b1000000-0000-0000-0000-000000000022	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-02-14 20:00:00+00	Session closed.
0515c6fc-219f-44bb-bd90-d183f251fb4e	b1000000-0000-0000-0000-000000000023	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-02-23 10:00:00+00	Session opened.
f993524c-cacf-4c3d-bca9-66a1d36fe7d3	b1000000-0000-0000-0000-000000000023	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-03-01 20:00:00+00	Session closed.
d14e9654-f06a-474d-98ca-20cf6057bce3	b1000000-0000-0000-0000-000000000024	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-03-09 10:00:00+00	Session opened.
7d6748f4-293e-4979-b6cb-ff1c41c21946	b1000000-0000-0000-0000-000000000024	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-03-14 20:00:00+00	Session closed.
d9a98dfe-747d-4d22-9ab2-fd8421828861	b1000000-0000-0000-0000-000000000025	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-03-16 10:00:00+00	Session opened.
dc39d922-4f49-4c36-b4ad-09dd2a1e11fa	b1000000-0000-0000-0000-000000000025	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-03-21 20:00:00+00	Session closed.
5aa2cd9d-8df6-4fa9-a137-c0d4aa4bbe4c	b1000000-0000-0000-0000-000000000026	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-04-06 10:00:00+00	Session opened.
5cad77e0-d172-4fb3-886b-3aec235b9246	b1000000-0000-0000-0000-000000000026	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-04-11 20:00:00+00	Session closed.
f5bc38be-0be8-4661-8ac8-3bd74f17e139	b1000000-0000-0000-0000-000000000027	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-04-20 10:00:00+00	Session opened.
c4467633-a27a-4fbf-84e9-ed10d2639a9b	b1000000-0000-0000-0000-000000000027	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-04-25 20:00:00+00	Session closed.
0e205d10-7bbd-4e9f-a5c5-c4162e1af4ba	b1000000-0000-0000-0000-000000000028	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-05-04 10:00:00+00	Session opened.
484b294a-9149-4399-b972-85f53d939a0e	b1000000-0000-0000-0000-000000000028	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-05-09 20:00:00+00	Session closed.
a70378df-cea5-4566-9d05-ea7b4e84bfea	b1000000-0000-0000-0000-000000000029	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-05-11 10:00:00+00	Session opened.
bd1644f5-b97a-408c-b07b-80b0341a3431	b1000000-0000-0000-0000-000000000029	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-05-21 20:00:00+00	Session closed.
bb9f6beb-7388-40ec-9a3f-da868ec5306c	b1000000-0000-0000-0000-00000000002a	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-05-18 10:00:00+00	Session opened.
2fe472d9-93b3-475a-b265-72e8fc304a55	b1000000-0000-0000-0000-00000000002a	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-05-23 20:00:00+00	Session closed.
c743a5c8-ba0e-4e8e-a477-69bec7b3fb24	b1000000-0000-0000-0000-00000000002b	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-06-01 10:00:00+00	Session opened.
72b77aca-096e-4c0c-adcf-3008ba90e544	b1000000-0000-0000-0000-00000000002b	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-06-06 20:00:00+00	Session closed.
2ea8c32e-3e7e-466b-996c-26a8d3b11ec5	b1000000-0000-0000-0000-00000000002c	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-06-15 10:00:00+00	Session opened.
940ac5f5-ad58-4d35-80c9-578b7bf09b9b	b1000000-0000-0000-0000-00000000002c	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-06-20 20:00:00+00	Session closed.
992baae4-4503-41df-94b6-060ae52fca12	b1000000-0000-0000-0000-00000000002d	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-06-29 10:00:00+00	Session opened.
b1ec7a35-28d7-4d5d-8f6f-1e6deae48247	b1000000-0000-0000-0000-00000000002d	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-07-04 20:00:00+00	Session closed.
3bbf6345-093d-45f2-8cde-87c6f621c17a	b1000000-0000-0000-0000-00000000002e	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-07-13 10:00:00+00	Session opened.
e414df07-85b2-4497-a6c8-dc0f74c5cbe8	b1000000-0000-0000-0000-00000000002e	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-07-18 20:00:00+00	Session closed.
0b21066b-2e6b-4a81-8007-6b5b881e219e	b1000000-0000-0000-0000-00000000002f	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-07-20 10:00:00+00	Session opened.
28fc7f6a-88f9-4a67-a4f5-6d0e835bb33b	b1000000-0000-0000-0000-00000000002f	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-07-25 20:00:00+00	Session closed.
06225413-5789-43e9-a5f9-e95a1658c99d	b1000000-0000-0000-0000-000000000030	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-08-03 10:00:00+00	Session opened.
fbf94fa6-a380-46e7-bf3b-705da6f708ff	b1000000-0000-0000-0000-000000000030	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-08-08 20:00:00+00	Session closed.
671bf2f1-276a-49ef-ae09-8756bf53054e	b1000000-0000-0000-0000-000000000031	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-08-17 10:00:00+00	Session opened.
aafe8850-1f80-4f6b-8e34-849f3758c9f3	b1000000-0000-0000-0000-000000000031	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-08-22 20:00:00+00	Session closed.
ecaccd23-6d94-49dc-ab06-4a7fda0a3f5c	b1000000-0000-0000-0000-000000000032	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-08-31 10:00:00+00	Session opened.
003b8b63-eb2b-4f0c-b206-2b3875ec0433	b1000000-0000-0000-0000-000000000032	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-09-05 20:00:00+00	Session closed.
ad796845-32b7-4799-a057-cf8a3e04bfd1	b1000000-0000-0000-0000-000000000033	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-09-14 10:00:00+00	Session opened.
4566bcce-e915-4dd9-ae06-75195e30471e	b1000000-0000-0000-0000-000000000033	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-09-24 20:00:00+00	Session closed.
13d18ac9-04c7-4bf9-bd3a-2fb963cf461a	b1000000-0000-0000-0000-000000000034	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-09-21 10:00:00+00	Session opened.
dab08eb7-29d0-4deb-b73c-505b92a67774	b1000000-0000-0000-0000-000000000034	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-09-26 20:00:00+00	Session closed.
1166682e-e7d8-4f18-82ad-bf02d0bc6bea	b1000000-0000-0000-0000-000000000035	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-10-05 10:00:00+00	Session opened.
97489632-fde8-4374-9561-4aaaf1844c35	b1000000-0000-0000-0000-000000000035	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-10-10 20:00:00+00	Session closed.
374673ae-ee9a-4071-8a1d-cfafc50c42f7	b1000000-0000-0000-0000-000000000036	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-10-19 10:00:00+00	Session opened.
57f2aab0-04f2-4b80-8b27-9b957855d30e	b1000000-0000-0000-0000-000000000036	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-10-24 20:00:00+00	Session closed.
f8836e62-e64a-46b4-be9e-ed53d9b10629	b1000000-0000-0000-0000-000000000037	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-11-02 10:00:00+00	Session opened.
88243c31-0b9a-4a8c-a7a0-ce9443d74eae	b1000000-0000-0000-0000-000000000037	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2025-11-07 20:00:00+00	Session closed.
e09d244b-3b1d-4f05-b07b-bc20a9e8d0ef	b1000000-0000-0000-0000-000000000038	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-11-16 10:00:00+00	Session opened.
045525a9-80f9-490a-bac2-b69ae7a084f1	b1000000-0000-0000-0000-00000000003b	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-11-30 10:00:00+00	Session opened.
87357301-c974-422a-a6da-804c660dbd9b	b1000000-0000-0000-0000-000000000039	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-12-07 10:00:00+00	Session opened.
fddaf618-a6cc-4468-b5ae-c10569f156a5	b1000000-0000-0000-0000-00000000003c	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-12-07 10:00:00+00	Session opened.
d0216a3f-94f3-4a85-b8cf-1b006be84964	b1000000-0000-0000-0000-00000000003a	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-12-14 10:00:00+00	Session opened.
cb7b99fe-fe3e-4e64-8d31-177158a4d700	b1000000-0000-0000-0000-00000000003d	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2025-12-14 10:00:00+00	Session opened.
71b97ae1-eaeb-48a9-b356-257f942ffc72	b1000000-0000-0000-0000-00000000003e	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2026-01-11 10:00:00+00	Session opened.
cb751800-e161-47a4-b353-defb3c85f955	b1000000-0000-0000-0000-00000000003e	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2026-01-16 20:00:00+00	Session closed.
99a09366-0999-4b9c-8e80-680c422bd791	b1000000-0000-0000-0000-00000000003f	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2026-01-18 10:00:00+00	Session opened.
77c966b2-ea41-447d-8bb3-e7bf6678df11	b1000000-0000-0000-0000-00000000003f	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2026-01-23 20:00:00+00	Session closed.
fc5f1ccd-5246-4c78-8667-a90087846e0f	b1000000-0000-0000-0000-000000000040	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2026-01-25 10:00:00+00	Session opened.
51cc5bd1-6b42-4b88-b6f7-1e98c73fc139	b1000000-0000-0000-0000-000000000040	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2026-01-30 20:00:00+00	Session closed.
13aec529-4a95-4380-b5c2-adca6432b71e	b1000000-0000-0000-0000-000000000041	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2026-02-01 10:00:00+00	Session opened.
3ba71485-05ce-4eb7-b5c1-b42f953c5d53	b1000000-0000-0000-0000-000000000045	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2026-02-08 10:00:00+00	Session opened.
acbe646f-c4c1-4e56-b1af-9c38367fb452	b1000000-0000-0000-0000-000000000045	ACTIVE	CONCLUDED	c1000000-0000-0000-0000-000000000001	2026-02-13 20:00:00+00	Session closed.
72df71ea-692d-4d13-8a12-87114729b226	b1000000-0000-0000-0000-000000000042	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2026-02-08 10:00:00+00	Session opened.
31c94f6a-f7a5-43d2-aca5-c8f7f190b9c9	b1000000-0000-0000-0000-000000000046	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2026-02-15 10:00:00+00	Session opened.
34170e70-5bf9-4241-904b-836ed8d07f5b	b1000000-0000-0000-0000-000000000043	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2026-02-15 10:00:00+00	Session opened.
ca6fab2e-eb81-43cf-af82-9ec3f0d91bd7	b1000000-0000-0000-0000-000000000044	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2026-02-22 10:00:00+00	Session opened.
ad20e788-0995-46b3-808d-4df1d892ff74	5c97d67f-76f8-464b-9bf5-ae98f5752095	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2026-03-13 10:00:00+00	Session opened.
4e173c7d-a5b5-4d81-af15-7c2d25232e81	d862c38d-38e7-4bec-9c65-05cb39dd54c4	PLANNED	ACTIVE	c1000000-0000-0000-0000-000000000001	2027-02-01 10:00:00+00	Session opened.
\.


--
-- Data for Name: meetings; Type: TABLE DATA; Schema: core; Owner: isep_app
--

COPY core.meetings (meeting_id, body_id, session_number, title, start_date, end_date, location, meeting_type, status, cancellation_reason, notes, created_at, updated_at, created_by) FROM stdin;
b1000000-0000-0000-0000-00000000001c	a0000000-0000-0000-0000-000000000002	133	Council 133	2024-12-09	2024-12-13	New Delhi	HYBRID	CONCLUDED	\N	The Council considered mid-term strategy, programme and budget, and oversight of committee work. Decisions and resolutions were adopted. The Council reviewed the work programme and requested the Secretariat to prepare documentation for the next session.\n\nThe meeting was held in New Delhi. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000000e	a0000000-0000-0000-0000-000000000009	10	III 10	2024-06-03	2024-06-07	Mumbai	VIRTUAL	CONCLUDED	\N	Implementation of IMO instruments, the audit scheme, and port State control matters were discussed. Guidelines and procedures were reviewed. The Sub-Committee agreed on next steps and requested the Secretariat to prepare relevant documentation.\n\nThe meeting was held in Mumbai. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000001d	a0000000-0000-0000-0000-000000000009	11	III 11	2024-12-16	2024-12-20	Hyderabad	IN_PERSON	CONCLUDED	\N	Implementation of IMO instruments, the audit scheme, and port State control matters were discussed. Guidelines and procedures were reviewed. The Sub-Committee agreed on next steps and requested the Secretariat to prepare relevant documentation.\n\nThe meeting was held in Hyderabad. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000003f	a0000000-0000-0000-0000-00000000000a	15	NCSR 15	2026-01-19	2026-01-23	London	IN_PERSON	CONCLUDED	\N	Navigation, communications, search and rescue, and pollution prevention items were on the agenda. The Sub-Committee considered e-navigation, GMDSS modernization, and related draft amendments. Working and correspondence group outcomes were noted; several documents were deferred for further consideration. The Secretariat was requested to prepare a consolidated document for the parent committee.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-03 10:23:27.048895+00	2026-03-03 10:23:27.048895+00	\N
b1000000-0000-0000-0000-000000000001	a0000000-0000-0000-0000-000000000003	107	MSC 107	2024-01-15	2024-01-24	London	IN_PERSON	CONCLUDED	\N	This session of the Maritime Safety Committee addressed a broad range of safety-related items, including amendments to SOLAS and related codes, and the adoption of new guidelines. The Committee considered reports from sub-committees and correspondence groups, and agreed on a number of draft resolutions for submission to the Assembly. Delegations expressed support for the work undertaken and highlighted the importance of consistent implementation across member states. The Secretariat was requested to circulate the agreed documents and to include the relevant items in the work programme for the next session.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000006	a0000000-0000-0000-0000-00000000000c	10	SDC 10	2024-03-04	2024-03-08	Chennai	HYBRID	CONCLUDED	\N	Ship design and construction and ship systems and equipment were discussed. Goal-based standards, life-saving appliances, and fire protection were among the topics. The Sub-Committee agreed on draft amendments and on the extension of mandates for correspondence groups where necessary. Progress on the revision of circulars was noted.\n\nThe meeting was held in Chennai. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000003	a0000000-0000-0000-0000-000000000008	32	HTW 32	2024-02-05	2024-02-09	Kolkata	IN_PERSON	CONCLUDED	\N	The Sub-Committee on Human Element, Training and Watchkeeping reviewed proposed amendments to the STCW Convention and Code, and considered model courses and other guidance. Correspondence group reports were received and discussed; the Sub-Committee agreed on next steps for the revision of certain provisions. Delegations stressed the importance of maintaining high standards of training and the need for clear implementation guidelines.\n\nThe meeting was held in Kolkata. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000005	a0000000-0000-0000-0000-00000000000b	11	PPR 11	2024-02-26	2024-03-01	Hyderabad	IN_PERSON	CONCLUDED	\N	Navigation, communications, search and rescue, and pollution prevention items were on the agenda. The Sub-Committee considered e-navigation, GMDSS modernization, and related draft amendments. Working and correspondence group outcomes were noted; several documents were deferred for further consideration. The Secretariat was requested to prepare a consolidated document for the parent committee.\n\nThe meeting was held in Hyderabad. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000007	a0000000-0000-0000-0000-00000000000d	10	SSE 10	2024-03-11	2024-03-15	Goa	IN_PERSON	CONCLUDED	\N	Ship design and construction and ship systems and equipment were discussed. Goal-based standards, life-saving appliances, and fire protection were among the topics. The Sub-Committee agreed on draft amendments and on the extension of mandates for correspondence groups where necessary. Progress on the revision of circulars was noted.\n\nThe meeting was held in Goa. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000008	a0000000-0000-0000-0000-00000000000e	9	CCC 9	2024-03-18	2024-03-22	Mumbai	VIRTUAL	CONCLUDED	\N	The Sub-Committee on Carriage of Cargoes and Containers considered amendments to the IMSBC Code and matters related to the IGF Code. Proposals from member states and industry were discussed; the Sub-Committee agreed on a number of amendments and on the need for further work on certain items. The Secretariat was asked to issue the agreed amendments in due course.\n\nThe meeting was held in Mumbai. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000004	a0000000-0000-0000-0000-00000000000a	11	NCSR 11	2024-02-19	2024-02-23	New Delhi	VIRTUAL	CONCLUDED	\N	Navigation, communications, search and rescue, and pollution prevention items were on the agenda. The Sub-Committee considered e-navigation, GMDSS modernization, and related draft amendments. Working and correspondence group outcomes were noted; several documents were deferred for further consideration. The Secretariat was requested to prepare a consolidated document for the parent committee.\n\nThe meeting was held in New Delhi. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000002	a0000000-0000-0000-0000-000000000004	81	MEPC 81	2024-01-22	2024-01-26	Mumbai	HYBRID	CONCLUDED	\N	The Marine Environment Protection Committee considered environmental matters including the implementation of the GHG strategy, ballast water management, and marine plastic litter. Draft resolutions and guidelines were prepared for adoption, and the Committee noted the progress of correspondence groups. Several member states submitted documents and interventions; the Secretariat was asked to consolidate comments and prepare a revised text for the next meeting. The need for capacity building and technical cooperation was underlined.\n\nThe meeting was held in Mumbai. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000000a	a0000000-0000-0000-0000-000000000006	75	TCC 75	2024-04-08	2024-04-12	New Delhi	HYBRID	CONCLUDED	\N	Technical cooperation and capacity-building were discussed. The Committee reviewed TC programmes and the integration of new conventions into technical assistance projects. Donor coordination and regional initiatives were also on the agenda. The Secretariat was requested to continue its work in line with the agreed strategy.\n\nThe meeting was held in New Delhi. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000000b	a0000000-0000-0000-0000-000000000007	48	FAL 48	2024-04-22	2024-04-26	Hyderabad	IN_PERSON	CONCLUDED	\N	The Facilitation Committee considered formalities and the single window concept, and discussed convention amendments and best practices. Draft recommendations were agreed. The Committee noted the importance of digitalization and of harmonized procedures across member states.\n\nThe meeting was held in Hyderabad. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000010	a0000000-0000-0000-0000-000000000008	33	HTW 33	2024-07-01	2024-07-05	New Delhi	HYBRID	CONCLUDED	\N	The Sub-Committee on Human Element, Training and Watchkeeping reviewed proposed amendments to the STCW Convention and Code, and considered model courses and other guidance. Correspondence group reports were received and discussed; the Sub-Committee agreed on next steps for the revision of certain provisions. Delegations stressed the importance of maintaining high standards of training and the need for clear implementation guidelines.\n\nThe meeting was held in New Delhi. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000013	a0000000-0000-0000-0000-00000000000c	11	SDC 11	2024-08-05	2024-08-09	Goa	IN_PERSON	CONCLUDED	\N	Ship design and construction and ship systems and equipment were discussed. Goal-based standards, life-saving appliances, and fire protection were among the topics. The Sub-Committee agreed on draft amendments and on the extension of mandates for correspondence groups where necessary. Progress on the revision of circulars was noted.\n\nThe meeting was held in Goa. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000014	a0000000-0000-0000-0000-00000000000d	11	SSE 11	2024-08-19	2024-08-23	Mumbai	HYBRID	CONCLUDED	\N	Ship design and construction and ship systems and equipment were discussed. Goal-based standards, life-saving appliances, and fire protection were among the topics. The Sub-Committee agreed on draft amendments and on the extension of mandates for correspondence groups where necessary. Progress on the revision of circulars was noted.\n\nThe meeting was held in Mumbai. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000016	a0000000-0000-0000-0000-000000000003	109	MSC 109	2024-09-16	2024-09-25	New Delhi	IN_PERSON	CONCLUDED	\N	This session of the Maritime Safety Committee addressed a broad range of safety-related items, including amendments to SOLAS and related codes, and the adoption of new guidelines. The Committee considered reports from sub-committees and correspondence groups, and agreed on a number of draft resolutions for submission to the Assembly. Delegations expressed support for the work undertaken and highlighted the importance of consistent implementation across member states. The Secretariat was requested to circulate the agreed documents and to include the relevant items in the work programme for the next session.\n\nThe meeting was held in New Delhi. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000018	a0000000-0000-0000-0000-000000000005	113	LEGAL 113	2024-10-07	2024-10-11	Chennai	HYBRID	CONCLUDED	\N	The Legal Committee considered liability and compensation matters, treaty status, and legal aspects of maritime legislation. The Secretariat reported on recent ratifications and on the status of conventions. The Committee adopted a number of decisions and requested the Secretariat to prepare documentation for the next session.\n\nThe meeting was held in Chennai. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000000c	a0000000-0000-0000-0000-000000000003	108	MSC 108	2024-05-13	2024-05-22	Chennai	IN_PERSON	CONCLUDED	\N	This session of the Maritime Safety Committee addressed a broad range of safety-related items, including amendments to SOLAS and related codes, and the adoption of new guidelines. The Committee considered reports from sub-committees and correspondence groups, and agreed on a number of draft resolutions for submission to the Assembly. Delegations expressed support for the work undertaken and highlighted the importance of consistent implementation across member states. The Secretariat was requested to circulate the agreed documents and to include the relevant items in the work programme for the next session.\n\nThe meeting was held in Chennai. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000001a	a0000000-0000-0000-0000-000000000007	49	FAL 49	2024-11-04	2024-11-08	Mumbai	VIRTUAL	CONCLUDED	\N	The Facilitation Committee considered formalities and the single window concept, and discussed convention amendments and best practices. Draft recommendations were agreed. The Committee noted the importance of digitalization and of harmonized procedures across member states.\n\nThe meeting was held in Mumbai. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000001b	a0000000-0000-0000-0000-000000000001	33	Assembly 33	2024-11-18	2024-12-06	Kolkata	IN_PERSON	CONCLUDED	\N	The Assembly session addressed strategic planning, budget, and high-level policy. Reports from the Council and committees were received. Resolutions were adopted on a range of matters. The Assembly emphasized the need for effective implementation of instruments and for continued cooperation among member states.\n\nThe meeting was held in Kolkata. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000025	a0000000-0000-0000-0000-00000000000e	11	CCC 11	2025-03-17	2025-03-21	Goa	VIRTUAL	CONCLUDED	\N	The Sub-Committee on Carriage of Cargoes and Containers considered amendments to the IMSBC Code and matters related to the IGF Code. Proposals from member states and industry were discussed; the Sub-Committee agreed on a number of amendments and on the need for further work on certain items. The Secretariat was asked to issue the agreed amendments in due course.\n\nThe meeting was held in Goa. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000001f	a0000000-0000-0000-0000-000000000003	110	MSC 110	2025-01-13	2025-01-22	Goa	IN_PERSON	CONCLUDED	\N	This session of the Maritime Safety Committee addressed a broad range of safety-related items, including amendments to SOLAS and related codes, and the adoption of new guidelines. The Committee considered reports from sub-committees and correspondence groups, and agreed on a number of draft resolutions for submission to the Assembly. Delegations expressed support for the work undertaken and highlighted the importance of consistent implementation across member states. The Secretariat was requested to circulate the agreed documents and to include the relevant items in the work programme for the next session.\n\nThe meeting was held in Goa. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000000d	a0000000-0000-0000-0000-000000000004	82	MEPC 82	2024-05-20	2024-05-24	Goa	HYBRID	CONCLUDED	\N	The Marine Environment Protection Committee considered environmental matters including the implementation of the GHG strategy, ballast water management, and marine plastic litter. Draft resolutions and guidelines were prepared for adoption, and the Committee noted the progress of correspondence groups. Several member states submitted documents and interventions; the Secretariat was asked to consolidate comments and prepare a revised text for the next meeting. The need for capacity building and technical cooperation was underlined.\n\nThe meeting was held in Goa. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000020	a0000000-0000-0000-0000-000000000004	84	MEPC 84	2025-01-20	2025-01-24	Mumbai	HYBRID	CONCLUDED	\N	The Marine Environment Protection Committee considered environmental matters including the implementation of the GHG strategy, ballast water management, and marine plastic litter. Draft resolutions and guidelines were prepared for adoption, and the Committee noted the progress of correspondence groups. Several member states submitted documents and interventions; the Secretariat was asked to consolidate comments and prepare a revised text for the next meeting. The need for capacity building and technical cooperation was underlined.\n\nThe meeting was held in Mumbai. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000026	a0000000-0000-0000-0000-000000000005	114	LEGAL 114	2025-04-07	2025-04-11	Mumbai	IN_PERSON	CONCLUDED	\N	The Legal Committee considered liability and compensation matters, treaty status, and legal aspects of maritime legislation. The Secretariat reported on recent ratifications and on the status of conventions. The Committee adopted a number of decisions and requested the Secretariat to prepare documentation for the next session.\n\nThe meeting was held in Mumbai. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000002e	a0000000-0000-0000-0000-00000000000a	14	NCSR 14	2025-07-14	2025-07-18	London	VIRTUAL	CONCLUDED	\N	Navigation, communications, search and rescue, and pollution prevention items were on the agenda. The Sub-Committee considered e-navigation, GMDSS modernization, and related draft amendments. Working and correspondence group outcomes were noted; several documents were deferred for further consideration. The Secretariat was requested to prepare a consolidated document for the parent committee.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000030	a0000000-0000-0000-0000-00000000000c	13	SDC 13	2025-08-04	2025-08-08	London	IN_PERSON	CONCLUDED	\N	Ship design and construction and ship systems and equipment were discussed. Goal-based standards, life-saving appliances, and fire protection were among the topics. The Sub-Committee agreed on draft amendments and on the extension of mandates for correspondence groups where necessary. Progress on the revision of circulars was noted.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000011	a0000000-0000-0000-0000-00000000000a	12	NCSR 12	2024-07-15	2024-07-19	Hyderabad	IN_PERSON	CONCLUDED	\N	Navigation, communications, search and rescue, and pollution prevention items were on the agenda. The Sub-Committee considered e-navigation, GMDSS modernization, and related draft amendments. Working and correspondence group outcomes were noted; several documents were deferred for further consideration. The Secretariat was requested to prepare a consolidated document for the parent committee.\n\nThe meeting was held in Hyderabad. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000001e	a0000000-0000-0000-0000-000000000008	34	HTW 34	2024-12-02	2024-12-06	Chennai	VIRTUAL	CONCLUDED	\N	The Sub-Committee on Human Element, Training and Watchkeeping reviewed proposed amendments to the STCW Convention and Code, and considered model courses and other guidance. Correspondence group reports were received and discussed; the Sub-Committee agreed on next steps for the revision of certain provisions. Delegations stressed the importance of maintaining high standards of training and the need for clear implementation guidelines.\n\nThe meeting was held in Chennai. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000022	a0000000-0000-0000-0000-00000000000b	13	PPR 13	2025-02-10	2025-02-14	New Delhi	VIRTUAL	CONCLUDED	\N	Navigation, communications, search and rescue, and pollution prevention items were on the agenda. The Sub-Committee considered e-navigation, GMDSS modernization, and related draft amendments. Working and correspondence group outcomes were noted; several documents were deferred for further consideration. The Secretariat was requested to prepare a consolidated document for the parent committee.\n\nThe meeting was held in New Delhi. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000002a	a0000000-0000-0000-0000-000000000004	85	MEPC 85	2025-05-19	2025-05-23	Chennai	VIRTUAL	CONCLUDED	\N	The Marine Environment Protection Committee considered environmental matters including the implementation of the GHG strategy, ballast water management, and marine plastic litter. Draft resolutions and guidelines were prepared for adoption, and the Committee noted the progress of correspondence groups. Several member states submitted documents and interventions; the Secretariat was asked to consolidate comments and prepare a revised text for the next meeting. The need for capacity building and technical cooperation was underlined.\n\nThe meeting was held in Chennai. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000000f	a0000000-0000-0000-0000-000000000002	132	Council 132	2024-06-17	2024-06-21	Kolkata	IN_PERSON	CONCLUDED	\N	The Council considered mid-term strategy, programme and budget, and oversight of committee work. Decisions and resolutions were adopted. The Council reviewed the work programme and requested the Secretariat to prepare documentation for the next session.\n\nThe meeting was held in Kolkata. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000031	a0000000-0000-0000-0000-00000000000d	13	SSE 13	2025-08-18	2025-08-22	Goa	VIRTUAL	CONCLUDED	\N	Ship design and construction and ship systems and equipment were discussed. Goal-based standards, life-saving appliances, and fire protection were among the topics. The Sub-Committee agreed on draft amendments and on the extension of mandates for correspondence groups where necessary. Progress on the revision of circulars was noted.\n\nThe meeting was held in Goa. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000015	a0000000-0000-0000-0000-00000000000e	10	CCC 10	2024-09-02	2024-09-06	Kolkata	IN_PERSON	CONCLUDED	\N	The Sub-Committee on Carriage of Cargoes and Containers considered amendments to the IMSBC Code and matters related to the IGF Code. Proposals from member states and industry were discussed; the Sub-Committee agreed on a number of amendments and on the need for further work on certain items. The Secretariat was asked to issue the agreed amendments in due course.\n\nThe meeting was held in Kolkata. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000017	a0000000-0000-0000-0000-000000000004	83	MEPC 83	2024-09-23	2024-09-27	Hyderabad	VIRTUAL	CONCLUDED	\N	The Marine Environment Protection Committee considered environmental matters including the implementation of the GHG strategy, ballast water management, and marine plastic litter. Draft resolutions and guidelines were prepared for adoption, and the Committee noted the progress of correspondence groups. Several member states submitted documents and interventions; the Secretariat was asked to consolidate comments and prepare a revised text for the next meeting. The need for capacity building and technical cooperation was underlined.\n\nThe meeting was held in Hyderabad. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000019	a0000000-0000-0000-0000-000000000006	76	TCC 76	2024-10-21	2024-10-25	Goa	IN_PERSON	CONCLUDED	\N	Technical cooperation and capacity-building were discussed. The Committee reviewed TC programmes and the integration of new conventions into technical assistance projects. Donor coordination and regional initiatives were also on the agenda. The Secretariat was requested to continue its work in line with the agreed strategy.\n\nThe meeting was held in Goa. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000021	a0000000-0000-0000-0000-00000000000a	13	NCSR 13	2025-02-03	2025-02-07	Kolkata	IN_PERSON	CONCLUDED	\N	Navigation, communications, search and rescue, and pollution prevention items were on the agenda. The Sub-Committee considered e-navigation, GMDSS modernization, and related draft amendments. Working and correspondence group outcomes were noted; several documents were deferred for further consideration. The Secretariat was requested to prepare a consolidated document for the parent committee.\n\nThe meeting was held in Kolkata. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000002c	a0000000-0000-0000-0000-000000000002	134	Council 134	2025-06-16	2025-06-20	London	IN_PERSON	CONCLUDED	\N	The Council considered mid-term strategy, programme and budget, and oversight of committee work. Decisions and resolutions were adopted. The Council reviewed the work programme and requested the Secretariat to prepare documentation for the next session.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000037	a0000000-0000-0000-0000-000000000007	51	FAL 51	2025-11-03	2025-11-07	Goa	HYBRID	CONCLUDED	\N	The Facilitation Committee considered formalities and the single window concept, and discussed convention amendments and best practices. Draft recommendations were agreed. The Committee noted the importance of digitalization and of harmonized procedures across member states.\n\nThe meeting was held in Goa. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000038	a0000000-0000-0000-0000-000000000001	34	Assembly 34	2025-11-17	2025-12-05	London	IN_PERSON	ACTIVE	\N	The Assembly session addressed strategic planning, budget, and high-level policy. Reports from the Council and committees were received. Resolutions were adopted on a range of matters. The Assembly emphasized the need for effective implementation of instruments and for continued cooperation among member states.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000036	a0000000-0000-0000-0000-000000000006	78	TCC 78	2025-10-20	2025-10-24	Chennai	IN_PERSON	CONCLUDED	\N	Technical cooperation and capacity-building were discussed. The Committee reviewed TC programmes and the integration of new conventions into technical assistance projects. Donor coordination and regional initiatives were also on the agenda. The Secretariat was requested to continue its work in line with the agreed strategy.\n\nThe meeting was held in Chennai. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000039	a0000000-0000-0000-0000-000000000002	135	Council 135	2025-12-08	2025-12-12	Kolkata	VIRTUAL	PLANNED	\N	The Council considered mid-term strategy, programme and budget, and oversight of committee work. Decisions and resolutions were adopted. The Council reviewed the work programme and requested the Secretariat to prepare documentation for the next session.\n\nThe meeting was held in Kolkata. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000003c	a0000000-0000-0000-0000-00000000000a	15	NCSR 15	2025-12-08	2025-12-12	Goa	IN_PERSON	PLANNED	\N	Navigation, communications, search and rescue, and pollution prevention items were on the agenda. The Sub-Committee considered e-navigation, GMDSS modernization, and related draft amendments. Working and correspondence group outcomes were noted; several documents were deferred for further consideration. The Secretariat was requested to prepare a consolidated document for the parent committee.\n\nThe meeting was held in Goa. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-03 04:21:16.43638+00	\N
b1000000-0000-0000-0000-000000000009	a0000000-0000-0000-0000-000000000005	112	LEGAL 112	2024-04-01	2024-04-05	Kolkata	IN_PERSON	CONCLUDED	\N	The Legal Committee considered liability and compensation matters, treaty status, and legal aspects of maritime legislation. The Secretariat reported on recent ratifications and on the status of conventions. The Committee adopted a number of decisions and requested the Secretariat to prepare documentation for the next session.\n\nThe meeting was held in Kolkata. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000012	a0000000-0000-0000-0000-00000000000b	12	PPR 12	2024-07-22	2024-07-26	Chennai	VIRTUAL	CONCLUDED	\N	Navigation, communications, search and rescue, and pollution prevention items were on the agenda. The Sub-Committee considered e-navigation, GMDSS modernization, and related draft amendments. Working and correspondence group outcomes were noted; several documents were deferred for further consideration. The Secretariat was requested to prepare a consolidated document for the parent committee.\n\nThe meeting was held in Chennai. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000023	a0000000-0000-0000-0000-00000000000c	12	SDC 12	2025-02-24	2025-03-01	Hyderabad	HYBRID	CONCLUDED	\N	Ship design and construction and ship systems and equipment were discussed. Goal-based standards, life-saving appliances, and fire protection were among the topics. The Sub-Committee agreed on draft amendments and on the extension of mandates for correspondence groups where necessary. Progress on the revision of circulars was noted.\n\nThe meeting was held in Hyderabad. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000024	a0000000-0000-0000-0000-00000000000d	12	SSE 12	2025-03-10	2025-03-14	Chennai	IN_PERSON	CONCLUDED	\N	Ship design and construction and ship systems and equipment were discussed. Goal-based standards, life-saving appliances, and fire protection were among the topics. The Sub-Committee agreed on draft amendments and on the extension of mandates for correspondence groups where necessary. Progress on the revision of circulars was noted.\n\nThe meeting was held in Chennai. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000027	a0000000-0000-0000-0000-000000000006	77	TCC 77	2025-04-21	2025-04-25	London	HYBRID	CONCLUDED	\N	Technical cooperation and capacity-building were discussed. The Committee reviewed TC programmes and the integration of new conventions into technical assistance projects. Donor coordination and regional initiatives were also on the agenda. The Secretariat was requested to continue its work in line with the agreed strategy.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000028	a0000000-0000-0000-0000-000000000007	50	FAL 50	2025-05-05	2025-05-09	New Delhi	IN_PERSON	CONCLUDED	\N	The Facilitation Committee considered formalities and the single window concept, and discussed convention amendments and best practices. Draft recommendations were agreed. The Committee noted the importance of digitalization and of harmonized procedures across member states.\n\nThe meeting was held in New Delhi. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000029	a0000000-0000-0000-0000-000000000003	111	MSC 111	2025-05-12	2025-05-21	London	IN_PERSON	CONCLUDED	\N	This session of the Maritime Safety Committee addressed a broad range of safety-related items, including amendments to SOLAS and related codes, and the adoption of new guidelines. The Committee considered reports from sub-committees and correspondence groups, and agreed on a number of draft resolutions for submission to the Assembly. Delegations expressed support for the work undertaken and highlighted the importance of consistent implementation across member states. The Secretariat was requested to circulate the agreed documents and to include the relevant items in the work programme for the next session.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000002b	a0000000-0000-0000-0000-000000000009	12	III 12	2025-06-02	2025-06-06	London	HYBRID	CONCLUDED	\N	Implementation of IMO instruments, the audit scheme, and port State control matters were discussed. Guidelines and procedures were reviewed. The Sub-Committee agreed on next steps and requested the Secretariat to prepare relevant documentation.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000002d	a0000000-0000-0000-0000-000000000008	35	HTW 35	2025-06-30	2025-07-04	Kolkata	IN_PERSON	CONCLUDED	\N	The Sub-Committee on Human Element, Training and Watchkeeping reviewed proposed amendments to the STCW Convention and Code, and considered model courses and other guidance. Correspondence group reports were received and discussed; the Sub-Committee agreed on next steps for the revision of certain provisions. Delegations stressed the importance of maintaining high standards of training and the need for clear implementation guidelines.\n\nThe meeting was held in Kolkata. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000002f	a0000000-0000-0000-0000-00000000000b	14	PPR 14	2025-07-21	2025-07-25	Hyderabad	HYBRID	CONCLUDED	\N	Navigation, communications, search and rescue, and pollution prevention items were on the agenda. The Sub-Committee considered e-navigation, GMDSS modernization, and related draft amendments. Working and correspondence group outcomes were noted; several documents were deferred for further consideration. The Secretariat was requested to prepare a consolidated document for the parent committee.\n\nThe meeting was held in Hyderabad. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000032	a0000000-0000-0000-0000-00000000000e	12	CCC 12	2025-09-01	2025-09-05	Mumbai	IN_PERSON	CONCLUDED	\N	The Sub-Committee on Carriage of Cargoes and Containers considered amendments to the IMSBC Code and matters related to the IGF Code. Proposals from member states and industry were discussed; the Sub-Committee agreed on a number of amendments and on the need for further work on certain items. The Secretariat was asked to issue the agreed amendments in due course.\n\nThe meeting was held in Mumbai. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000033	a0000000-0000-0000-0000-000000000003	112	MSC 112	2025-09-15	2025-09-24	London	HYBRID	CONCLUDED	\N	This session of the Maritime Safety Committee addressed a broad range of safety-related items, including amendments to SOLAS and related codes, and the adoption of new guidelines. The Committee considered reports from sub-committees and correspondence groups, and agreed on a number of draft resolutions for submission to the Assembly. Delegations expressed support for the work undertaken and highlighted the importance of consistent implementation across member states. The Secretariat was requested to circulate the agreed documents and to include the relevant items in the work programme for the next session.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000034	a0000000-0000-0000-0000-000000000004	86	MEPC 86	2025-09-22	2025-09-26	New Delhi	IN_PERSON	CONCLUDED	\N	The Marine Environment Protection Committee considered environmental matters including the implementation of the GHG strategy, ballast water management, and marine plastic litter. Draft resolutions and guidelines were prepared for adoption, and the Committee noted the progress of correspondence groups. Several member states submitted documents and interventions; the Secretariat was asked to consolidate comments and prepare a revised text for the next meeting. The need for capacity building and technical cooperation was underlined.\n\nThe meeting was held in New Delhi. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-000000000035	a0000000-0000-0000-0000-000000000005	115	LEGAL 115	2025-10-06	2025-10-10	London	VIRTUAL	CONCLUDED	\N	The Legal Committee considered liability and compensation matters, treaty status, and legal aspects of maritime legislation. The Secretariat reported on recent ratifications and on the status of conventions. The Committee adopted a number of decisions and requested the Secretariat to prepare documentation for the next session.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000003b	a0000000-0000-0000-0000-000000000008	36	HTW 36	2025-12-01	2025-12-05	Hyderabad	HYBRID	PLANNED	\N	The Sub-Committee on Human Element, Training and Watchkeeping reviewed proposed amendments to the STCW Convention and Code, and considered model courses and other guidance. Correspondence group reports were received and discussed; the Sub-Committee agreed on next steps for the revision of certain provisions. Delegations stressed the importance of maintaining high standards of training and the need for clear implementation guidelines.\n\nThe meeting was held in Hyderabad. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000003a	a0000000-0000-0000-0000-000000000009	13	III 13	2025-12-15	2025-12-19	London	IN_PERSON	PLANNED	\N	Implementation of IMO instruments, the audit scheme, and port State control matters were discussed. Guidelines and procedures were reviewed. The Sub-Committee agreed on next steps and requested the Secretariat to prepare relevant documentation.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 06:58:06.885307+00	2026-03-01 06:58:06.885307+00	\N
b1000000-0000-0000-0000-00000000003d	a0000000-0000-0000-0000-000000000009	13	III 13	2025-12-15	2025-12-19	London	IN_PERSON	PLANNED	\N	Implementation of IMO instruments, the audit scheme, and port State control matters were discussed. Guidelines and procedures were reviewed. The Sub-Committee agreed on next steps and requested the Secretariat to prepare relevant documentation.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-03 10:23:27.048895+00	2026-03-03 10:23:27.048895+00	\N
b1000000-0000-0000-0000-00000000003e	a0000000-0000-0000-0000-000000000008	36	HTW 36	2026-01-12	2026-01-16	London	HYBRID	CONCLUDED	\N	The Sub-Committee on Human Element, Training and Watchkeeping reviewed proposed amendments to the STCW Convention and Code, and considered model courses and other guidance. Correspondence group reports were received and discussed; the Sub-Committee agreed on next steps for the revision of certain provisions. Delegations stressed the importance of maintaining high standards of training and the need for clear implementation guidelines.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-03 10:23:27.048895+00	2026-03-03 10:23:27.048895+00	\N
b1000000-0000-0000-0000-000000000040	a0000000-0000-0000-0000-00000000000b	15	PPR 15	2026-01-26	2026-01-30	London	VIRTUAL	CONCLUDED	\N	Navigation, communications, search and rescue, and pollution prevention items were on the agenda. The Sub-Committee considered e-navigation, GMDSS modernization, and related draft amendments. Working and correspondence group outcomes were noted; several documents were deferred for further consideration. The Secretariat was requested to prepare a consolidated document for the parent committee.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-03 10:23:27.048895+00	2026-03-03 10:23:27.048895+00	\N
b1000000-0000-0000-0000-000000000041	a0000000-0000-0000-0000-000000000003	113	MSC 113	2026-02-02	2026-02-11	London	IN_PERSON	ACTIVE	\N	This session of the Maritime Safety Committee addressed a broad range of safety-related items, including amendments to SOLAS and related codes, and the adoption of new guidelines. The Committee considered reports from sub-committees and correspondence groups, and agreed on a number of draft resolutions for submission to the Assembly. Delegations expressed support for the work undertaken and highlighted the importance of consistent implementation across member states. The Secretariat was requested to circulate the agreed documents and to include the relevant items in the work programme for the next session.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-03 10:23:27.048895+00	2026-03-03 10:23:27.048895+00	\N
b1000000-0000-0000-0000-000000000042	a0000000-0000-0000-0000-000000000004	87	MEPC 87	2026-02-09	2026-02-13	London	HYBRID	PLANNED	\N	The Marine Environment Protection Committee considered environmental matters including the implementation of the GHG strategy, ballast water management, and marine plastic litter. Draft resolutions and guidelines were prepared for adoption, and the Committee noted the progress of correspondence groups. Several member states submitted documents and interventions; the Secretariat was asked to consolidate comments and prepare a revised text for the next meeting. The need for capacity building and technical cooperation was underlined.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-03 10:23:27.048895+00	2026-03-03 10:23:27.048895+00	\N
b1000000-0000-0000-0000-000000000045	a0000000-0000-0000-0000-00000000000e	13	CCC 13	2026-02-09	2026-02-13	London	IN_PERSON	CONCLUDED	\N	The Sub-Committee on Carriage of Cargoes and Containers considered amendments to the IMSBC Code and matters related to the IGF Code. Proposals from member states and industry were discussed; the Sub-Committee agreed on a number of amendments and on the need for further work on certain items. The Secretariat was asked to issue the agreed amendments in due course.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-03 10:23:27.048895+00	2026-03-03 10:23:27.048895+00	\N
b1000000-0000-0000-0000-000000000043	a0000000-0000-0000-0000-00000000000c	14	SDC 14	2026-02-16	2026-02-20	London	IN_PERSON	PLANNED	\N	Ship design and construction and ship systems and equipment were discussed. Goal-based standards, life-saving appliances, and fire protection were among the topics. The Sub-Committee agreed on draft amendments and on the extension of mandates for correspondence groups where necessary. Progress on the revision of circulars was noted.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-03 10:23:27.048895+00	2026-03-03 10:23:27.048895+00	\N
b1000000-0000-0000-0000-000000000046	a0000000-0000-0000-0000-000000000007	52	FAL 52	2026-02-16	2026-02-20	London	HYBRID	PLANNED	\N	The Facilitation Committee considered formalities and the single window concept, and discussed convention amendments and best practices. Draft recommendations were agreed. The Committee noted the importance of digitalization and of harmonized procedures across member states.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-03 10:23:27.048895+00	2026-03-03 10:23:27.048895+00	\N
b1000000-0000-0000-0000-000000000044	a0000000-0000-0000-0000-00000000000d	14	SSE 14	2026-02-23	2026-02-27	London	VIRTUAL	PLANNED	\N	Ship design and construction and ship systems and equipment were discussed. Goal-based standards, life-saving appliances, and fire protection were among the topics. The Sub-Committee agreed on draft amendments and on the extension of mandates for correspondence groups where necessary. Progress on the revision of circulars was noted.\n\nThe meeting was held in London. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-03 10:23:27.048895+00	2026-03-03 10:23:27.048895+00	\N
5c97d67f-76f8-464b-9bf5-ae98f5752095	a0000000-0000-0000-0000-00000000000b	23	Environmental Pollution 2026	2026-03-14	2026-03-21	Jaipur	HYBRID	PLANNED	\N	The session addressed items on the work programme and considered reports from working and correspondence groups. The agenda was adopted and the chair reported on intersessional work. A number of submissions were considered and outcomes were agreed for submission to the parent committee as appropriate.\n\nThe meeting was held in Jaipur. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-01 11:41:06.372748+00	2026-03-01 12:33:19.116973+00	\N
d862c38d-38e7-4bec-9c65-05cb39dd54c4	0ba24eae-6aef-4010-9a19-d9057cf7bf80	7	Sea Fire Fighting	2027-02-02	2027-02-05	Colombo	IN_PERSON	PLANNED	\N	The session addressed items on the work programme and considered reports from working and correspondence groups. The agenda was adopted and the chair reported on intersessional work. A number of submissions were considered and outcomes were agreed for submission to the parent committee as appropriate.\n\nThe meeting was held in Colombo. Delegations were reminded of deadlines for submission of documents and of the need to coordinate with the Secretariat on logistical matters. The next session will consider any remaining items and follow-up actions.\n\nSummary reports and agreed documents will be circulated by the Secretariat. Member states are invited to provide comments and to participate in the relevant correspondence groups where established.	2026-03-03 18:03:07.216224+00	2026-03-03 18:22:55.977625+00	\N
\.


--
-- Data for Name: papers; Type: TABLE DATA; Schema: core; Owner: isep_app
--

COPY core.papers (paper_id, meeting_id, agenda_item_id, title, status, draft_content, draft_version, draft_saved_at, draft_last_modified_by, created_at, updated_at) FROM stdin;
7d5705a0-4fa8-425f-9f61-a53355258581	5c97d67f-76f8-464b-9bf5-ae98f5752095	6d71c3c4-1c0a-4682-b34e-273a4d352128	Draft position paper – Environmental Pollution 2026	DRAFT	Draft content for Environmental Pollution 2026. To be finalized.	0	\N	\N	2026-03-03 10:23:27.250911+00	2026-03-03 10:23:27.250911+00
b17b415a-9b59-4503-9d9f-5e655ebf0fc8	b1000000-0000-0000-0000-000000000044	eb11b98d-b01d-49f8-bd4d-4a14d96ee906	Draft position paper – SSE 14	DRAFT	Draft content for SSE 14. To be finalized.	0	\N	\N	2026-03-03 10:23:27.251296+00	2026-03-03 10:23:27.251296+00
7aa21d20-4f32-48c6-9060-0cf61aed7eb1	b1000000-0000-0000-0000-000000000043	0c907982-9d51-4094-9562-07bc306f420e	Draft position paper – SDC 14	DRAFT	Draft content for SDC 14. To be finalized.	0	\N	\N	2026-03-03 10:23:27.251376+00	2026-03-03 10:23:27.251376+00
a8dd2e85-bd93-45f8-b879-fe7616f9cad8	b1000000-0000-0000-0000-000000000046	567bf4fe-ee03-4b64-ad30-49ade68e6c83	Draft position paper – FAL 52	DRAFT	Draft content for FAL 52. To be finalized.	0	\N	\N	2026-03-03 10:23:27.251442+00	2026-03-03 10:23:27.251442+00
aa06c920-ac84-4b42-9828-469378159ed2	b1000000-0000-0000-0000-000000000042	f800818b-a2c7-4dc0-afba-d67545412d2a	Draft position paper – MEPC 87	DRAFT	Draft content for MEPC 87. To be finalized.	0	\N	\N	2026-03-03 10:23:27.251505+00	2026-03-03 10:23:27.251505+00
f6cd8ed6-99ad-4e7c-90af-93127594a7b7	b1000000-0000-0000-0000-000000000045	c47c303d-4904-4501-975a-64a0bf36ee69	Draft position paper – CCC 13	DRAFT	Draft content for CCC 13. To be finalized.	0	\N	\N	2026-03-03 10:23:27.251588+00	2026-03-03 10:23:27.251588+00
b44a1646-2566-4427-8329-2abe58dc78d2	b1000000-0000-0000-0000-000000000041	2b8088fa-5394-46f5-9f75-71e1604a4fe8	Draft position paper – MSC 113	DRAFT	Draft content for MSC 113. To be finalized.	0	\N	\N	2026-03-03 10:23:27.251648+00	2026-03-03 10:23:27.251648+00
0645e084-7dd0-494a-9be4-4183e83abaaf	b1000000-0000-0000-0000-000000000040	e9d2520d-39c3-4dc0-ab73-dd95d28c4779	Draft position paper – PPR 15	DRAFT	Draft content for PPR 15. To be finalized.	0	\N	\N	2026-03-03 10:23:27.251678+00	2026-03-03 10:23:27.251678+00
38aac085-bd52-4e93-bb90-d8734e4decb1	b1000000-0000-0000-0000-00000000003f	7fb1e791-9856-4d80-837f-336fe0d55358	Draft position paper – NCSR 15	DRAFT	Draft content for NCSR 15. To be finalized.	0	\N	\N	2026-03-03 10:23:27.251717+00	2026-03-03 10:23:27.251717+00
df1e58dc-1231-46f4-b4ad-168b932b0ff7	b1000000-0000-0000-0000-00000000003e	483322e6-11b0-4f32-ae69-361b2faa92c6	Draft position paper – HTW 36	DRAFT	Draft content for HTW 36. To be finalized.	0	\N	\N	2026-03-03 10:23:27.251747+00	2026-03-03 10:23:27.251747+00
e6a42caf-605c-4f77-8e7d-3139e0fa989a	b1000000-0000-0000-0000-00000000003d	4a37aa8e-78f5-4eea-ad4b-509918c60ba4	Draft position paper – III 13	DRAFT	Draft content for III 13. To be finalized.	0	\N	\N	2026-03-03 10:23:27.251775+00	2026-03-03 10:23:27.251775+00
e667baac-e7ce-4a4d-a81d-a0351c395ec3	b1000000-0000-0000-0000-00000000003a	cb526bd6-659e-4f1d-898d-a1c1d428d2eb	Draft position paper – III 13	DRAFT	Draft content for III 13. To be finalized.	0	\N	\N	2026-03-03 10:23:27.251803+00	2026-03-03 10:23:27.251803+00
69a5e95d-6062-40bd-b906-d40451e09ba5	b1000000-0000-0000-0000-00000000003c	e51de703-612e-4988-8655-e12fa8e83e00	Draft position paper – NCSR 15	DRAFT	Draft content for NCSR 15. To be finalized.	0	\N	\N	2026-03-03 10:23:27.251865+00	2026-03-03 10:23:27.251865+00
a847210d-7b2c-4b32-808c-a5713546c75d	b1000000-0000-0000-0000-000000000039	1f700e8d-80dc-474f-8dc6-92add0c493a2	Draft position paper – Council 135	DRAFT	Draft content for Council 135. To be finalized.	0	\N	\N	2026-03-03 10:23:27.251893+00	2026-03-03 10:23:27.251893+00
cfc741bf-f870-4708-868b-b26775fbb7ee	b1000000-0000-0000-0000-00000000003b	5fdddf56-c896-4101-a4bd-b5c074dc5d01	Draft position paper – HTW 36	DRAFT	Draft content for HTW 36. To be finalized.	0	\N	\N	2026-03-03 10:23:27.251923+00	2026-03-03 10:23:27.251923+00
\.


--
-- Data for Name: reference_data; Type: TABLE DATA; Schema: core; Owner: isep_app
--

COPY core.reference_data (category, code, label, sort_order, is_active, created_at) FROM stdin;
agenda_priority	LOW	Low	3	t	2026-02-28 12:15:53.782974+00
agenda_status	DRAFT	Draft	1	t	2026-02-28 12:15:53.782974+00
agenda_status	ACTIVE	Active	2	t	2026-02-28 12:15:53.782974+00
agenda_status	CLOSED	Closed	3	t	2026-02-28 12:15:53.782974+00
filter_year	2022	2022	1	t	2026-02-28 12:15:53.782974+00
filter_year	2023	2023	2	t	2026-02-28 12:15:53.782974+00
filter_year	2024	2024	3	t	2026-02-28 12:15:53.782974+00
filter_year	2025	2025	4	t	2026-02-28 12:15:53.782974+00
filter_year	2026	2026	5	t	2026-02-28 12:15:53.782974+00
filter_year	2027	2027	6	t	2026-02-28 12:15:53.782974+00
meeting_role	DELEGATION_LEADER	Delegation Leader	1	t	2026-02-28 12:15:53.782974+00
meeting_role	MEMBER	Member	2	t	2026-02-28 12:15:53.782974+00
meeting_role	OBSERVER	Observer	3	t	2026-02-28 12:15:53.782974+00
meeting_type	IN_PERSON	In person	1	t	2026-02-28 12:15:53.782974+00
meeting_type	VIRTUAL	Virtual	2	t	2026-02-28 12:15:53.782974+00
meeting_type	HYBRID	Hybrid	3	t	2026-02-28 12:15:53.782974+00
meeting_status	PLANNED	Planned	1	t	2026-02-28 12:15:53.782974+00
meeting_status	ACTIVE	Active	2	t	2026-02-28 12:15:53.782974+00
meeting_status	CONCLUDED	Concluded	3	t	2026-02-28 12:15:53.782974+00
meeting_status	ARCHIVED	Archived	4	t	2026-02-28 12:15:53.782974+00
meeting_status	CANCELLED	Cancelled	5	t	2026-02-28 12:15:53.782974+00
body_type	ASSEMBLY	Assembly	1	t	2026-02-28 12:15:53.782974+00
body_type	COUNCIL	Council	2	t	2026-02-28 12:15:53.782974+00
body_type	COMMITTEE	Committee	3	t	2026-02-28 12:15:53.782974+00
body_type	SUB_COMMITTEE	Sub-Committee	4	t	2026-02-28 12:15:53.782974+00
body_type	WORKING_GROUP	Working Group	5	t	2026-02-28 12:15:53.782974+00
body_type	CORRESPONDENCE_GROUP	Correspondence Group	6	t	2026-02-28 12:15:53.782974+00
body_type	BILATERAL	Bilateral	7	t	2026-02-28 12:15:53.782974+00
body_type	OTHER	Other	8	t	2026-02-28 12:15:53.782974+00
agenda_category	DISCUSSION	Discussion	1	t	2026-02-28 12:15:53.782974+00
agenda_category	DECISION	Decision	2	t	2026-02-28 12:15:53.782974+00
agenda_category	INFORMATION	Information	3	t	2026-02-28 12:15:53.782974+00
agenda_category	ANY_OTHER_BUSINESS	Any Other Business	4	t	2026-02-28 12:15:53.782974+00
agenda_priority	HIGH	High	1	t	2026-02-28 12:15:53.782974+00
agenda_priority	MEDIUM	Medium	2	t	2026-02-28 12:15:53.782974+00
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: core; Owner: isep_app
--

COPY core.tasks (task_id, title, description, agenda_item_id, meeting_id, document_id, assigned_to, assigned_by, priority, due_date, status, closed_at, created_at, updated_at) FROM stdin;
79b6390a-2bf8-4f1a-9e4c-abb43e5f0f49	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000002	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-01-20 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
94497768-31e4-4209-982e-94ccaa30df8f	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000002	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-01-21 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
c5b2d34d-ab2a-42c3-84a5-2ece60db5c75	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000002	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-01-22 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
c5525969-59b3-42f4-88c5-b4f2e43ba256	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000005	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-02-24 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
79edbe92-1d44-45d1-8c2c-af531d2036e5	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000005	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-02-25 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
e9bf31f5-8dc4-4a75-88e0-8046992030aa	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000005	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-02-26 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
25dd05e6-da13-45dd-817b-818316b51d2a	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000000e	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-06-01 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
d7c77269-a0fb-4792-9f86-d0e52337c63f	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000000e	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-06-02 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
6b03a54b-b737-4c9a-bbf4-b3adccf72ccc	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000000e	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-06-03 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
e108c02c-fcbd-4636-92f9-b7a542dc5e4c	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000001	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-01-13 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
aafaefbb-274f-4681-a91b-74431edb4deb	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000001	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-01-14 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
c50196b4-b28d-4710-8b49-e906a0431e32	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000001	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-01-15 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
c2102e82-0c4f-4b1a-84c4-54f2faf79c13	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000003	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-02-03 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
fb7ca673-b64a-4e27-9aa5-cbd211cf351f	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000003	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-02-04 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
7780b8a3-a17d-4aee-b337-a5d3d9b79b78	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000003	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-02-05 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
5e789444-f54a-4b75-886e-44e2fcbfec3d	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000004	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-02-17 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
f1a63dd6-ad40-4db2-b0cf-f330e01d01ce	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000004	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-02-18 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
7bcab86d-6541-42ca-abd0-ff767c2a9ebe	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000004	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-02-19 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
159023bc-f578-4e0b-807e-3ea9965cbda7	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000006	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-03-02 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
92da0d6b-029b-4904-b116-c164a70de33f	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000006	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-03-03 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
b9d1aec5-7a7c-40d2-accf-f9bf3527fdf1	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000006	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-03-04 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
1d86641b-7dab-4413-bf50-523a91af5435	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000007	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-03-09 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
1201ac63-2946-40c0-9302-382628c25ce7	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000007	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-03-10 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
06a467cf-0923-4fee-a50d-6cf579ab477f	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000007	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-03-11 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
b4d2058c-a750-487f-86e9-37f3e3587dce	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000008	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-03-16 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
5042fe87-9467-4fbc-a662-795bec6f7fda	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000008	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-03-17 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
3b2f2984-d191-49c2-9013-34f9ee9038fe	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000008	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-03-18 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
ec53d3bb-1e68-401b-9fd8-04e79497502a	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000009	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-03-30 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
34ecb5a1-9b7f-4bd0-9895-7c85b484b025	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000009	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-03-31 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
f487d89f-843b-4e2d-a17a-c9175c2d6b38	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000009	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-04-01 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
15896f82-df89-4963-9c7c-58f5b300e056	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000000a	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-04-06 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
fe666ceb-23b5-471c-90f9-df0f33d72387	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000000a	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-04-07 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
3ba1f135-1b76-47c6-81ac-42f8437a4615	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000000a	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-04-08 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
84ef44d8-7e6f-4453-b351-84f24a16d4f8	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000000b	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-04-20 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
bf3e5e3e-847d-4ec9-ae71-20d652929df5	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000000b	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-04-21 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
d41dc502-f54e-4f04-baef-28af2a5c74a5	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000000b	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-04-22 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
6ad5ac8c-f771-4148-9c60-3dfc009d7d35	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000000c	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-05-11 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
0809a56f-b0f7-4bfb-801f-f24304055c96	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000000c	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-05-12 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
acf60d02-d3f2-477e-ab2a-723bd971afef	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000000c	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-05-13 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
0970e6d2-f56a-4f56-82f6-39f487752425	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000000d	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-05-18 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
fef09cf1-d9e6-4030-a9e5-bea39107a819	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000000d	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-05-19 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
36777c14-864f-486b-b553-c5c550675d23	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000000d	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-05-20 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
80a4cd52-fe9a-4554-82a2-807b27ca5ffb	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000000f	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-06-15 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
7700c004-7e62-4137-a597-7d4b4def9d7b	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000000f	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-06-16 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
331db4a3-ee63-4548-8df3-5500b7b3e00b	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000000f	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-06-17 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
3a9a352c-9bc2-430d-905d-6b0bf496da90	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000010	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-06-29 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
f0fda6dd-40d2-44be-a079-cf903d8ac2ae	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000010	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-06-30 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
47f736cd-6dd0-4416-873a-d565bc60c0d6	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000010	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-07-01 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
8de02412-fa95-457c-9343-89c777947b15	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000011	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-07-13 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
13ab1a77-31d8-4797-9e67-a335babc885b	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000011	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-07-14 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
82112cac-d969-4a49-a7e6-9fb6649d1900	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000011	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-07-15 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
a324430d-db24-4a94-8ce2-0cdd3c55dd8d	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000012	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-07-20 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
7f04a414-4785-4700-8427-c1d4513aea2a	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000012	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-07-21 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
9ca6562f-f9c0-434d-9bc8-e243807da4f9	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000012	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-07-22 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
8ea5d1de-67ec-44e5-8c75-c84c44353c7e	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000013	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-08-03 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
8b4eb8c5-2b8e-4d02-8bff-1bbb9b8c6048	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000013	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-08-04 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
ee86930c-b151-4ac1-8639-738f77f00f2f	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000013	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-08-05 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
a9d85c45-c2aa-48c8-87b5-32223396e031	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000014	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-08-17 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
cbcab8da-9331-4a5e-9ed0-3ba4e6f43f4e	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000014	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-08-18 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
693164d0-98d5-49a2-96ad-e8dc2f2afd71	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000014	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-08-19 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
da6fd1f1-fbca-4f47-80f0-9d0988893eea	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000015	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-08-31 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
b61f13ac-3d34-4cc8-aae3-972bb6b8228a	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000015	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-09-01 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
7b4aa90d-bda6-4c71-af0a-f250e3b0cd57	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000015	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-09-02 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
7b3a2490-13a7-4e77-9ae9-8006a35851f8	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000016	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-09-14 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
f86fbebd-0756-4abe-9c3f-22d0f1bf9962	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000016	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-09-15 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
58d7c800-292e-48f5-b375-487c4d7c5025	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000016	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-09-16 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
a3b08d87-f2e5-464b-b796-072cd9936afe	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000017	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-09-21 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
cf341d7f-5aa7-46a7-b233-75ed8b9f737d	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000017	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-09-22 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
7966557b-f7e2-45ab-8954-fe93903027fc	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000017	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-09-23 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
11ad4133-5a6e-4e2e-8f64-ad3d78bfcfaf	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000018	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-10-05 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
e57334bf-0a8f-4307-8e83-6d0de9ccd638	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000018	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-10-06 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
db3b0cdd-2a1d-48f8-85b0-d18e29d5a231	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000018	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-10-07 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
0259b321-90af-482e-bc6e-1559ff49f89e	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000019	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-10-19 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
5a3b6612-b2d6-4d31-b7be-59778e28b2c3	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000019	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-10-20 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
00422680-454e-415f-a795-6a4e8d8e93ea	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000019	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-10-21 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
171cbf63-b1d2-49ea-95e5-711ebdaba4fa	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000001a	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-11-02 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
82825af5-afaf-4cf5-850a-eb960b00edb5	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000001a	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-11-03 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
e9975ddc-a1e0-43c5-bfb1-b382d8816d2b	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000001a	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-11-04 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
1b6c8d5a-2bec-4ef1-9130-cd7bd7840c2c	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000001b	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-11-16 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
7a93f4f3-0abe-42c3-b2f2-55719ee9fe10	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000001b	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-11-17 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
1cbc98d6-5a76-4d47-b801-781f7cdf0533	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000001b	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-11-18 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
5231ae2d-e066-48fb-93cb-fdae2251462a	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000001e	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-11-30 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
5ad13a7b-b726-4baf-b188-2a0dc344299c	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000001e	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-12-01 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
a3501c1c-0111-454a-85e7-38910a1938db	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000001e	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-12-02 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
30983a0f-9017-4297-b7d4-0af7bcd8484b	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000001c	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-12-07 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
89aa4a09-6235-4919-877c-d2273943fb79	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000001c	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-12-08 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
a79d1680-3c2e-4414-9eb5-2b851e173676	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000001c	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-12-09 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
90a81310-7401-4123-b2c8-ee0485aa9adc	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000001d	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2024-12-14 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
40f8ae96-fce1-45a3-b185-690e2a3d6e20	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000001d	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2024-12-15 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
863ca7e3-c17a-4db1-984b-d2c8b9b0e2fe	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000001d	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2024-12-16 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
ece6adaf-efc9-49dd-a24c-222ae8bbedba	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000001f	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-01-11 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
2d045039-b993-4013-8b1e-2450a11b597c	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000001f	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-01-12 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
0417de83-0150-4480-8b48-87a5df036ac6	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000001f	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-01-13 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
68c42eea-d223-454a-aa86-13c6fe0ca7d7	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000020	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-01-18 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
ccf2f24c-802c-4f27-8992-41871c4487bd	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000020	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-01-19 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
7248e941-c17e-4e40-8d76-6d71ba95a2e7	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000020	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-01-20 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
0384938b-a8a7-4c76-9dee-996ad37d2716	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000021	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-02-01 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
5559474c-d9a4-4645-a83a-8b5422c4f760	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000021	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-02-02 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
e5d868e0-ceff-4070-9e00-0c1399406516	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000021	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-02-03 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
a7616979-d14e-47e5-84a4-2f6de1ecdf57	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000022	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-02-08 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
4777a112-6cad-4d27-8f93-9cc421c6005c	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000022	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-02-09 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
d0929308-1c3e-440b-8883-03bc59215bb8	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000022	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-02-10 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
f7952015-4bc7-4482-9482-fae3eb12ca02	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000023	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-02-22 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
466b1781-f5a5-48c1-a0ed-312cb8e2b8e4	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000023	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-02-23 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
ee2b3109-7e52-4d58-8dba-5745059c4ac3	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000023	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-02-24 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
c3293874-b405-48ef-8755-ba82af905a4a	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000024	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-03-08 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
d312a0f1-080d-40ec-9ef0-f6b13a87f2ac	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000024	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-03-09 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
4e26014c-aebf-4333-b5df-7fd3c2f65b1e	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000024	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-03-10 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
1e0f1fe0-1920-4729-8b35-4e5efd812b58	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000025	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-03-15 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
965f0939-3c7a-4a13-a354-1c5e0170c312	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000025	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-03-16 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
034a18e1-b032-49aa-b646-80b88fc0e1fa	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000025	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-03-17 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
1074d25b-e4ed-45ae-9bbc-f64ac7b8e018	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000026	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-04-05 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
427d8c24-5b2d-425b-a448-29a4f8b8c6c6	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000026	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-04-06 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
b7fd0b70-9949-4251-880d-ed18e0e9acb1	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000026	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-04-07 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
0f673565-1cc2-451a-9a85-257b23b01d10	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000027	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-04-19 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
e03a535f-8b1f-4c9b-93c3-736fcdaabf8e	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000027	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-04-20 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
5eedfa9e-7b31-4d34-ba29-dbb7bf2f8376	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000027	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-04-21 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
6d20cbd6-99fa-475f-956e-3f4b9239f766	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000028	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-05-03 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
4572216a-8038-4a35-958a-5a02a6bf6b0d	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000028	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-05-04 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
e92ebea4-ceba-4d9d-be6f-bac054a6d0b7	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000028	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-05-05 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
f4690189-efe0-4842-9ea8-39a449884a17	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000029	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-05-10 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
2be37630-cc43-4bd6-9fce-913e39d85991	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000029	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-05-11 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
b7323ce7-db60-4fa7-ae83-be58bf5b8e52	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000029	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-05-12 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
3e81b253-ab50-4ccf-aa5c-7d44be194a18	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000002a	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-05-17 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
d11da82f-a83b-4fd9-b669-937270ce4d93	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000002a	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-05-18 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
6ce31462-6d33-42ad-85a4-01ac06811071	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000002a	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-05-19 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
25640467-a559-4ef2-b928-09188b300878	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000002b	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-05-31 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
4fe24708-3dcc-4f79-a07c-09aad264320b	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000002b	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-06-01 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
9bc8b08f-d5b8-46b2-963f-feed53d22536	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000002b	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-06-02 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
0758512e-8812-41ce-9702-bbef7ef3ee17	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000002c	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-06-14 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
28ade78e-bc14-4f88-ac2f-1bb4b771f648	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000002c	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-06-15 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
b4675836-22da-459a-8d86-ca41361cc9de	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000002c	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-06-16 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
8da6cd44-a9c9-4ce8-8560-98bb251fbcfc	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000002d	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-06-28 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
500d82ec-f74d-4896-871b-fc99207eecf0	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000002d	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-06-29 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
3c588677-8b4a-4ae6-963d-e9553a856adf	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000002d	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-06-30 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
56404b91-d092-4d48-b2ce-df9cb767b386	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000002e	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-07-12 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
ce6e7cd3-de03-4f20-9439-2db036b1eafb	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000002e	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-07-13 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
ba678892-8396-4ff3-9173-d98d87e0cfe6	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000002e	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-07-14 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
0bf1209d-10fc-4648-a585-8230ef7287fb	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000002f	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-07-19 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
ff473b1f-26ec-4260-afc9-09283ff51e37	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000002f	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-07-20 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
eea06ebf-73cb-4d7f-8bed-c45126095d46	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000002f	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-07-21 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
95fe23d7-8865-44b3-b15d-3a0f66d7752a	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000030	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-08-02 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
00c87655-fdc5-44d0-88d7-70a0e32fb3e9	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000030	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-08-03 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
5e2102eb-bb7c-4e14-b146-029b8ce540c8	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000030	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-08-04 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
4f8510f5-84db-4bfb-b1fe-e5616c73432f	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000031	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-08-16 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
c74d6616-2152-4367-a944-82d36006681a	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000031	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-08-17 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
e0bd544a-0a07-4a46-93a5-14017a51abe3	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000031	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-08-18 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
13609f08-2fe5-4c86-8dd4-9b688593deee	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000032	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-08-30 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
95178b35-cb67-43a3-a15a-cf5fa4b37ed5	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000032	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-08-31 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
784c2ee2-4d9d-4428-9e36-ac6c7adab37d	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000032	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-09-01 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
da01e359-6670-4002-a467-7399e558c21b	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000033	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-09-13 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
7f5d18d2-6996-4ee9-8564-35f9fbbde86f	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000033	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-09-14 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
7dddb2ae-27e8-4e10-ba5b-48037f309e54	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000033	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-09-15 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
1e6b0749-3837-4132-9032-ead433accb80	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000034	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-09-20 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
3177637b-83b0-4011-8874-d28250901dfd	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000034	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-09-21 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
63f8037b-d274-40d1-a935-c74ab536ed0b	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000034	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-09-22 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
8d3ea504-192a-4986-89fb-13b61a5cb202	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000035	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-10-04 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
fcea6af9-4e07-4c74-8ab1-eefcd5ba4b6d	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000035	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-10-05 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
1854f822-1d0a-4fbb-8fa3-f66d2f0f755d	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000035	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-10-06 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
767f5114-9ee1-498e-b3cb-efb683a149d5	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000036	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-10-18 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
b5eb9b0d-e0b4-4c4f-9bb8-b09572048f23	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000036	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-10-19 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
4eb1e8a0-3633-42de-838e-b1538a9aa872	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000036	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-10-20 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
c39abcf3-543b-46ef-b655-cbfa7c879a75	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000037	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-11-01 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
5816319e-a7de-4cbb-ba45-3be5af70d7da	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000037	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-11-02 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
a0c05a62-2e91-4d3d-9602-233a9a356175	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000037	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-11-03 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
5938b1a0-7fb6-4568-ad0f-2dfc2c963144	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000038	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-11-15 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
3820470b-fb89-4c0a-b1a2-c97352b41d39	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000038	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-11-16 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
25400b06-4d5b-45d6-9170-f56a78aa8c3d	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000038	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-11-17 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
62d18028-d466-404e-8896-4cfcb64807cd	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000003b	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-11-29 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
bb6a440d-a8b6-486a-a202-e9b622bb7129	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000003b	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-11-30 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
5cb9c4f9-4d86-4cc0-ac21-4a67ac9bec7a	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000003b	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-12-01 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
a8d2c6d2-edfa-4656-abbe-dc972fa68fde	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000003c	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-12-06 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
aea0cb9c-2daa-438c-bd59-8dd801e6dfcd	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000003c	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-12-07 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
008f97dd-42b8-46c6-bc64-abbd0008a64b	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000003c	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-12-08 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
c723b031-1721-46f7-928b-7450099180b1	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000039	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-12-06 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
ce2eb03a-150c-4c22-ad4b-8362c36b427c	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000039	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-12-07 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
a5f48d8b-371c-4dfb-a20b-6a083ea4c42b	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000039	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-12-08 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
6ab51da5-f480-4bb4-bf6b-b3e19e7f644c	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000003a	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-12-13 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
057ae635-a57f-4e6a-9c7e-cbd38819522c	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000003a	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-12-14 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
456b231f-91ad-482f-bbf6-349edd7165a0	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000003a	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-12-15 00:00:00+00	ASSIGNED	\N	2026-03-01 07:55:57.367968+00	2026-03-01 07:55:57.367968+00
3bd1632d-054e-4597-a0d1-2b8b67da199f	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000003d	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2025-12-13 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
e9ef6419-6d68-4caa-ae7b-6542b9395b3c	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000003d	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2025-12-14 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
df6eca69-691b-4bc4-b46d-4f3e31c7d8e5	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000003d	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2025-12-15 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
22a8e980-7481-44b3-b4cc-3f9311ba3b1f	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000044	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2026-02-21 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
b9e100bc-c827-4a47-8f4d-3c14cca4cb13	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000044	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2026-02-22 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
cbe761e0-521a-4a35-b8f8-1e66aab5a9cc	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000044	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2026-02-23 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
34d1c989-1314-4ff0-8d68-c3b57027a479	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000003e	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2026-01-10 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
01b87deb-1af6-43d3-a566-a9dc8aac27eb	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000003e	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2026-01-11 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
2cbadb22-350d-4004-9990-8c35dac089e8	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000003e	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2026-01-12 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
7a091750-88cc-4cce-906d-7fe25eca4f1d	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-00000000003f	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2026-01-17 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
6fe674db-ade4-408d-85f3-e4c3e83763c4	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-00000000003f	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2026-01-18 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
2d9fc1f8-b955-4978-a24c-009c3267203d	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-00000000003f	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2026-01-19 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
a63efbf9-87fd-46ac-86d1-f28d81e3955b	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000040	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2026-01-24 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
52c76308-78d8-4b29-83a8-e75a0729df85	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000040	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2026-01-25 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
30381ce0-bb71-4acf-8559-d74ec2836710	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000040	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2026-01-26 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
6d4d2f94-73a3-4a33-a7d8-07e1ec5fb5f6	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000041	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2026-01-31 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
bc4a39be-412f-456c-a576-8746c91b9a29	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000041	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2026-02-01 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
a4295455-912b-41b8-a2f9-2b131adfe5e2	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000041	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2026-02-02 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
1f6a7734-9cf3-468c-8690-1366a223fd3d	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000045	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2026-02-07 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
d9f8bb12-bbe6-4bd5-adb7-18aaa5747057	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000045	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2026-02-08 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
81fee423-3793-494a-8b2b-f8728ae99598	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000045	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2026-02-09 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
53825b04-0305-43cc-9377-5d193b5337ce	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000042	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2026-02-07 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
333d3329-9cee-4fbe-b71d-503619e7a6f2	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000042	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2026-02-08 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
230fb96e-a725-496a-8246-7229f34e93f7	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000042	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2026-02-09 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
d45ea977-00ee-4005-9c83-b6e937b5f27d	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000046	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2026-02-14 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
3b42bc89-d3cf-40fd-8ab1-0ab5af95d2bb	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000046	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2026-02-15 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
56d34b91-79de-4ad8-a5a6-2bf8bebebf5d	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000046	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2026-02-16 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
fa8737c4-9cc0-4521-a74b-76905f1fb3bd	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	b1000000-0000-0000-0000-000000000043	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2026-02-14 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
c7258f77-ae8c-4ad1-8bee-0e991d7955d4	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	b1000000-0000-0000-0000-000000000043	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2026-02-15 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
ef5b2896-dd2e-4262-8ee4-95fd41187fee	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	b1000000-0000-0000-0000-000000000043	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2026-02-16 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
a79c4b20-7d70-4566-aa6e-03a2fb149a82	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	5c97d67f-76f8-464b-9bf5-ae98f5752095	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2026-03-12 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
6c12d28e-3291-4478-ac92-e644259f907d	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	5c97d67f-76f8-464b-9bf5-ae98f5752095	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2026-03-13 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
7bc201f5-da0c-48ef-8f4c-31b3df7490ce	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	5c97d67f-76f8-464b-9bf5-ae98f5752095	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2026-03-14 00:00:00+00	ASSIGNED	\N	2026-03-03 10:23:27.205425+00	2026-03-03 10:23:27.205425+00
65f1e057-10f3-457e-84dc-89041688531d	Prepare briefing notes	Briefing notes for delegation on key agenda items.	\N	d862c38d-38e7-4bec-9c65-05cb39dd54c4	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	HIGH	2027-01-31 00:00:00+00	ASSIGNED	\N	2026-03-03 18:25:29.511349+00	2026-03-03 18:25:29.511349+00
83a9c2bb-7df3-4840-a9da-2b94bf400ed1	Circulate position paper	Draft and circulate position paper to stakeholders.	\N	d862c38d-38e7-4bec-9c65-05cb39dd54c4	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	MEDIUM	2027-02-01 00:00:00+00	ASSIGNED	\N	2026-03-03 18:25:29.511349+00	2026-03-03 18:25:29.511349+00
8c6a3766-12bb-4188-a0e5-ae50ceebfd66	Follow-up with Secretariat	Follow up with Secretariat on document deadlines.	\N	d862c38d-38e7-4bec-9c65-05cb39dd54c4	\N	c1000000-0000-0000-0000-000000000001	c1000000-0000-0000-0000-000000000001	LOW	2027-02-02 00:00:00+00	ASSIGNED	\N	2026-03-03 18:25:29.511349+00	2026-03-03 18:25:29.511349+00
fa9eb9ec-c9bd-483c-b455-387c3c12d3ec	Meeting Document circulation	Cicrculate following documents Fixed CO2 fire-extinguishing systems — Revised guidelines	\N	d862c38d-38e7-4bec-9c65-05cb39dd54c4	\N	c1000000-0000-0000-0000-000000000004	c1000000-0000-0000-0000-000000000004	HIGH	2026-03-31 12:00:00+00	ASSIGNED	\N	2026-03-04 05:32:46.462151+00	2026-03-04 05:32:46.462151+00
\.


--
-- Data for Name: user_body_assignments; Type: TABLE DATA; Schema: core; Owner: isep_app
--

COPY core.user_body_assignments (user_id, body_id, created_at) FROM stdin;
c1000000-0000-0000-0000-000000000002	a0000000-0000-0000-0000-00000000000e	2026-03-08 13:01:53.402407+00
c1000000-0000-0000-0000-000000000002	a0000000-0000-0000-0000-000000000001	2026-03-08 13:01:53.402407+00
c1000000-0000-0000-0000-000000000002	a0000000-0000-0000-0000-000000000002	2026-03-08 13:01:53.402407+00
c1000000-0000-0000-0000-000000000002	a0000000-0000-0000-0000-00000000000b	2026-03-08 13:01:53.402407+00
c1000000-0000-0000-0000-000000000002	0ba24eae-6aef-4010-9a19-d9057cf7bf80	2026-03-08 13:01:53.402407+00
c1000000-0000-0000-0000-000000000002	a0000000-0000-0000-0000-00000000000c	2026-03-08 13:01:53.402407+00
c1000000-0000-0000-0000-000000000002	a0000000-0000-0000-0000-00000000000d	2026-03-08 13:01:53.402407+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: core; Owner: isep_app
--

COPY core.users (user_id, keycloak_id, email, full_name, designation, organization, phone, system_role, is_active, mfa_enabled, last_login_at, created_at, updated_at, created_by, deleted_at) FROM stdin;
c1000000-0000-0000-0000-000000000002	seed-user-2	delegation.lead@isep.local	Sample Delegation Lead	Delegation Leader	DGS	\N	DELEGATION_LEADER	t	f	\N	2026-02-28 16:34:54.695828+00	2026-02-28 16:34:54.695828+00	\N	\N
c1000000-0000-0000-0000-000000000003	seed-user-3	member@isep.local	Sample Member	Member	DGS	\N	MEMBER	t	f	\N	2026-02-28 16:34:54.695828+00	2026-02-28 16:34:54.695828+00	\N	\N
c1000000-0000-0000-0000-000000000004	seed-user-4	adviser@isep.local	Jane Adviser	Technical Adviser	Maritime Authority	\N	MEMBER	t	f	\N	2026-03-01 07:09:59.931275+00	2026-03-01 07:09:59.931275+00	\N	\N
c1000000-0000-0000-0000-000000000005	seed-user-5	observer@isep.local	Alex Observer	Observer	Industry Association	\N	MEMBER	t	f	\N	2026-03-01 07:09:59.931275+00	2026-03-01 07:09:59.931275+00	\N	\N
c1000000-0000-0000-0000-000000000000	admin-sa	admin-sa@isep.local	System Admin	System Administrator	DGS	\N	SYSTEM_ADMIN	t	f	\N	2026-03-03 10:23:27.094309+00	2026-03-03 10:23:27.094309+00	\N	\N
c1000000-0000-0000-0000-000000000006	ic-head	ic.head@isep.local	IC Division Head	Division Head	DGS	\N	IC_DIVISION_HEAD	t	f	\N	2026-03-03 10:23:27.094309+00	2026-03-03 10:23:27.094309+00	\N	\N
c1000000-0000-0000-0000-000000000007	viewer-1	viewer@isep.local	Read Only Viewer	Viewer	DGS	\N	VIEWER	t	f	\N	2026-03-03 10:23:27.094309+00	2026-03-03 10:23:27.094309+00	\N	\N
c1000000-0000-0000-0000-000000000001	seed-user-1	coordinator@isep.local	Sample Coordinator	Coordinator	DGS	9977654321	COORDINATOR	t	f	\N	2026-02-28 16:34:54.695828+00	2026-02-28 16:34:54.695828+00	\N	\N
\.


--
-- Data for Name: cg_members; Type: TABLE DATA; Schema: correspondence; Owner: isep_app
--

COPY correspondence.cg_members (cg_member_id, cg_id, user_id, role, created_at) FROM stdin;
0236db02-9695-4ba7-8ac7-f4b6ffcc1257	f95c349b-7bf6-4c89-8c59-428006e62d4c	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
9b7385cc-3524-4955-8c33-6f4ab42d57ed	0f30691f-1762-4b98-8873-894954dcf3ed	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
c90e69ed-5dd8-4b00-94f4-ace0fcaa35b8	18eff9d4-b1be-45c1-a741-ab284b6635c1	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
115fb068-f42e-47d7-8c72-071abf30fdfe	0b627ccc-a983-4a15-aaf2-1df535343fa5	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
8e85bdf8-61a8-469a-adc9-ea3c46b049c6	95c791bf-e54f-4345-80d2-4aa8299b461d	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
0ba774a8-0781-487c-954c-0a208f369d0c	dbbdb86b-09d8-4d1c-ba11-6a81e55b2dd0	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
24764ef2-4db1-4a4e-91d7-850abdaaf5f1	c1dd5e0b-4162-47af-a55e-af4c6ec9ef91	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
cacecc18-0fb8-439b-b99d-b89810ce951e	c3f8c1bb-cbfe-4e1d-846d-3000d2897250	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
47ec99fa-e524-4553-97fa-35623c20f915	45f16c3a-cb19-4c27-9df1-504961c6fcf7	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
1bead5f7-f0e0-43ac-9b03-e7c3159fbd6d	84a84c98-102d-45b7-a1a5-315215410ec0	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
10c6d6e8-72b7-43f9-b3ed-5de1d58f0a4e	4657a7eb-908d-4809-bba4-33e5b1a6efe4	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
5275621a-5981-40b8-87ee-8155e58b418c	60a2f238-b237-4969-9a59-36d610374ff5	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
d47ece22-0c01-4852-8979-de2d18ada53a	15071ca4-85cd-456d-9283-4e7d79cc3670	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
90a59f89-5e02-412d-9be1-b8a5d4e0608e	644ba839-1ba1-4757-b1c9-206eb2d28373	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
21c9e3e3-796f-4065-b0f7-d722b4cda3a5	01e9bde6-23cd-41a1-938f-8d84aa9d1774	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
fdd3778b-cc42-43bf-8151-32f5e5797cde	cb25c3cb-32e6-4c23-b78a-1208bd6d329c	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
1e0d9938-d933-403b-a42a-b699837df9e2	ec5077bd-61c3-40cd-8cde-d03eb08a69d7	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
98c0e1cf-000c-479d-b207-0974f31d25ed	69ff2d60-35ca-4474-b408-cbc281ece0c8	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
ce8658c2-5746-468d-a1f6-a286dc5fca0a	176274bb-37a9-487b-8481-fe1e9229bd2d	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
6cc00544-5370-4d0a-a695-6626b0cc17c7	9150274b-8528-462f-9196-1e9609226d0d	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
bf5e7691-eff6-4203-918c-1b85056ce3b6	c0762eae-20ea-49d9-bacb-7f223a713589	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
b76d9764-0d12-444d-8463-edcdb1465e85	c8027edb-0504-4fd8-ac21-6a887399c3af	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
95b29451-b830-428e-888f-2c7f3a221054	594e85b9-fefb-40a0-b02d-fe974efa1e85	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
c3b3f059-fbc0-401a-962d-21910e433609	6b717a33-a261-4b3e-a84a-69266195c0f1	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
4252ecd7-2370-4f10-89ac-da4d6bd4129b	b8d19f72-2784-4dd1-a693-28afea471637	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
03107020-ce0a-47b1-93a1-8a9e60aa9974	afb76248-35d5-47db-8869-00415fe3683d	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
9239334d-5812-4f14-8281-94900cf41328	a58110d6-abc4-4bbe-b412-89d8fbfdd007	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
639256f0-f497-4e6f-a43b-b0e436a235c8	663b3e5a-6708-459e-9ecf-3c50d74d637e	c1000000-0000-0000-0000-000000000001	Lead	2026-03-01 07:55:57.375985+00
0d92eb29-3757-4711-b34a-8648a13ee33a	8a87977f-9192-4d23-8d12-dce71b3b353f	c1000000-0000-0000-0000-000000000001	Lead	2026-03-03 10:23:27.210392+00
7235aace-9109-4437-8637-533da3fee4c1	7ac04357-2e3e-42f2-be2e-e3d4a702a25d	c1000000-0000-0000-0000-000000000001	Lead	2026-03-03 10:23:27.210392+00
ebb34ebf-7f6c-41ce-bb59-1fb79cb4151b	3071587d-52e3-40b2-906e-5f681ed97e77	c1000000-0000-0000-0000-000000000001	Member	2026-03-03 10:23:27.211321+00
929250d2-a19d-4db0-abe4-b87650ea92c8	6ea45bdd-ab9e-4a2e-bff4-c57ead75997c	c1000000-0000-0000-0000-000000000001	Lead	2026-03-03 18:25:29.519851+00
fe466ec3-fb40-4412-9498-d6290d21c870	31879258-4eca-4392-882f-2a9b44e6910b	c1000000-0000-0000-0000-000000000001	Lead	2026-03-03 18:25:29.519851+00
cfd983f6-ae9c-4f46-87e6-9b21204beca0	f95c349b-7bf6-4c89-8c59-428006e62d4c	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.429205+00
b9400f20-da0c-46ac-87ea-1ceac6de0ec2	0f30691f-1762-4b98-8873-894954dcf3ed	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.429334+00
5197dfde-41aa-4f04-96c4-44f707db36a4	a58110d6-abc4-4bbe-b412-89d8fbfdd007	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.429413+00
8ca4a0b8-95f9-4478-bc3f-ad3d4758547b	663b3e5a-6708-459e-9ecf-3c50d74d637e	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.429488+00
7a03076d-34d4-4933-945e-1ee1d92db49f	18eff9d4-b1be-45c1-a741-ab284b6635c1	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.42956+00
7e940475-5cd0-4c65-be85-985765d031e5	0b627ccc-a983-4a15-aaf2-1df535343fa5	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.429628+00
627fad7f-57d4-4303-9a06-3b2002e66f85	15071ca4-85cd-456d-9283-4e7d79cc3670	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.429693+00
020e6097-12fc-43f1-80bc-bc4586e52d1e	644ba839-1ba1-4757-b1c9-206eb2d28373	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.42977+00
242e7b33-ef5e-49ae-a44a-3ea3125ed360	01e9bde6-23cd-41a1-938f-8d84aa9d1774	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.429874+00
a07f8b1b-3f2c-4ecf-9af0-2c4af1a6417d	cb25c3cb-32e6-4c23-b78a-1208bd6d329c	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.429939+00
bb15295e-47b5-418a-a1ba-6bb09c0fb98a	ec5077bd-61c3-40cd-8cde-d03eb08a69d7	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.430021+00
9f26eae4-3dd6-4c23-ac00-3d3bc7012047	69ff2d60-35ca-4474-b408-cbc281ece0c8	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.43009+00
864d7f86-bbdf-4a3f-987f-28a3c7b8b530	45f16c3a-cb19-4c27-9df1-504961c6fcf7	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.430152+00
3346976e-5a14-4ba9-bb3c-2b37783bf028	84a84c98-102d-45b7-a1a5-315215410ec0	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.430224+00
27f8f6af-f39e-4ff4-9aa1-94f1953f93df	c1dd5e0b-4162-47af-a55e-af4c6ec9ef91	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.430292+00
a9244c9f-d115-4ba8-abe0-4275d04133a0	c3f8c1bb-cbfe-4e1d-846d-3000d2897250	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.430366+00
024c99c4-e1ec-4fe2-9ef7-5e48c1ce4282	95c791bf-e54f-4345-80d2-4aa8299b461d	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.430463+00
83191297-b722-4f2c-be9d-d49e3ee4a4ae	dbbdb86b-09d8-4d1c-ba11-6a81e55b2dd0	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.430597+00
a0667c5d-dbfa-4d83-a88a-2886e2d82e90	176274bb-37a9-487b-8481-fe1e9229bd2d	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.430674+00
ef3daff2-bc8e-4405-8d93-c01fdd3c6335	9150274b-8528-462f-9196-1e9609226d0d	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.430754+00
f6af751a-3d73-42ba-a32b-7c09d972aa62	c0762eae-20ea-49d9-bacb-7f223a713589	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.430832+00
9776ce66-e2f0-413c-8472-a3f93fc81244	c8027edb-0504-4fd8-ac21-6a887399c3af	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.430896+00
bd69a0f5-2552-4256-be15-509559eba518	594e85b9-fefb-40a0-b02d-fe974efa1e85	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.431038+00
f7629369-8885-4ec8-84fc-53a651bc649b	6b717a33-a261-4b3e-a84a-69266195c0f1	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.431107+00
dbfabe26-03f0-4a07-98b0-2a7f7cd02f3c	b8d19f72-2784-4dd1-a693-28afea471637	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.431172+00
754903c3-05c4-481e-af34-d40a04005033	afb76248-35d5-47db-8869-00415fe3683d	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.431235+00
90d7e5f1-2baa-48de-9f17-5a55c3ba38b7	4657a7eb-908d-4809-bba4-33e5b1a6efe4	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.431301+00
4d7973c5-b053-4975-9d75-f062864a022f	60a2f238-b237-4969-9a59-36d610374ff5	c1000000-0000-0000-0000-000000000002	Member	2026-03-08 13:01:53.431368+00
\.


--
-- Data for Name: correspondence_groups; Type: TABLE DATA; Schema: correspondence; Owner: isep_app
--

COPY correspondence.correspondence_groups (cg_id, parent_body_id, name, mandate, india_lead_id, start_date, end_date, status, imso_reference, created_at, updated_at) FROM stdin;
f95c349b-7bf6-4c89-8c59-428006e62d4c	a0000000-0000-0000-0000-000000000001	Assembly CG 1	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
0f30691f-1762-4b98-8873-894954dcf3ed	a0000000-0000-0000-0000-000000000001	Assembly CG 2	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
18eff9d4-b1be-45c1-a741-ab284b6635c1	a0000000-0000-0000-0000-000000000002	Council CG 1	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
0b627ccc-a983-4a15-aaf2-1df535343fa5	a0000000-0000-0000-0000-000000000002	Council CG 2	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
95c791bf-e54f-4345-80d2-4aa8299b461d	a0000000-0000-0000-0000-000000000003	Maritime Safety Committee CG 1	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
dbbdb86b-09d8-4d1c-ba11-6a81e55b2dd0	a0000000-0000-0000-0000-000000000003	Maritime Safety Committee CG 2	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
c1dd5e0b-4162-47af-a55e-af4c6ec9ef91	a0000000-0000-0000-0000-000000000004	Marine Environment Protection Committee CG 1	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
c3f8c1bb-cbfe-4e1d-846d-3000d2897250	a0000000-0000-0000-0000-000000000004	Marine Environment Protection Committee CG 2	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
45f16c3a-cb19-4c27-9df1-504961c6fcf7	a0000000-0000-0000-0000-000000000005	Legal Committee CG 1	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
84a84c98-102d-45b7-a1a5-315215410ec0	a0000000-0000-0000-0000-000000000005	Legal Committee CG 2	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
4657a7eb-908d-4809-bba4-33e5b1a6efe4	a0000000-0000-0000-0000-000000000006	Technical Cooperation Committee CG 1	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
60a2f238-b237-4969-9a59-36d610374ff5	a0000000-0000-0000-0000-000000000006	Technical Cooperation Committee CG 2	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
15071ca4-85cd-456d-9283-4e7d79cc3670	a0000000-0000-0000-0000-000000000007	Facilitation Committee CG 1	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
644ba839-1ba1-4757-b1c9-206eb2d28373	a0000000-0000-0000-0000-000000000007	Facilitation Committee CG 2	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
01e9bde6-23cd-41a1-938f-8d84aa9d1774	a0000000-0000-0000-0000-000000000008	Human Element, Training and Watchkeeping CG 1	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
cb25c3cb-32e6-4c23-b78a-1208bd6d329c	a0000000-0000-0000-0000-000000000008	Human Element, Training and Watchkeeping CG 2	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
ec5077bd-61c3-40cd-8cde-d03eb08a69d7	a0000000-0000-0000-0000-000000000009	Implementation of IMO Instruments CG 1	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
69ff2d60-35ca-4474-b408-cbc281ece0c8	a0000000-0000-0000-0000-000000000009	Implementation of IMO Instruments CG 2	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
176274bb-37a9-487b-8481-fe1e9229bd2d	a0000000-0000-0000-0000-00000000000a	Navigation, Communications and Search & Rescue CG 1	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
9150274b-8528-462f-9196-1e9609226d0d	a0000000-0000-0000-0000-00000000000a	Navigation, Communications and Search & Rescue CG 2	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
c0762eae-20ea-49d9-bacb-7f223a713589	a0000000-0000-0000-0000-00000000000b	Pollution Prevention and Response CG 1	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
c8027edb-0504-4fd8-ac21-6a887399c3af	a0000000-0000-0000-0000-00000000000b	Pollution Prevention and Response CG 2	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
594e85b9-fefb-40a0-b02d-fe974efa1e85	a0000000-0000-0000-0000-00000000000c	Ship Design and Construction CG 1	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
6b717a33-a261-4b3e-a84a-69266195c0f1	a0000000-0000-0000-0000-00000000000c	Ship Design and Construction CG 2	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
b8d19f72-2784-4dd1-a693-28afea471637	a0000000-0000-0000-0000-00000000000d	Ship Systems and Equipment CG 1	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
afb76248-35d5-47db-8869-00415fe3683d	a0000000-0000-0000-0000-00000000000d	Ship Systems and Equipment CG 2	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
a58110d6-abc4-4bbe-b412-89d8fbfdd007	a0000000-0000-0000-0000-00000000000e	Carriage of Cargoes and Containers CG 1	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
663b3e5a-6708-459e-9ecf-3c50d74d637e	a0000000-0000-0000-0000-00000000000e	Carriage of Cargoes and Containers CG 2	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-01 07:55:57.373822+00	2026-03-01 07:55:57.373822+00
8a87977f-9192-4d23-8d12-dce71b3b353f	237fe69c-db32-4cb0-a8b2-fe1a9b5203d2	Legal Weapon Control Committe CG 1	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-03 10:23:27.209081+00	2026-03-03 10:23:27.209081+00
7ac04357-2e3e-42f2-be2e-e3d4a702a25d	237fe69c-db32-4cb0-a8b2-fe1a9b5203d2	Legal Weapon Control Committe CG 2	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2025-12-31	ACTIVE	\N	2026-03-03 10:23:27.209081+00	2026-03-03 10:23:27.209081+00
3071587d-52e3-40b2-906e-5f681ed97e77	a0000000-0000-0000-0000-000000000003	Safety Measures Group	1. Preperation of Safety Measures\n2. Annual review of all safety measures\n3. Audit of safety measures	c1000000-0000-0000-0000-000000000001	2026-01-01	2030-12-31	ACTIVE	\N	2026-03-03 04:32:50.915016+00	2026-03-03 04:32:50.915016+00
6ea45bdd-ab9e-4a2e-bff4-c57ead75997c	0ba24eae-6aef-4010-9a19-d9057cf7bf80	Safety during Fire Fighting CG 1	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2027-12-31	ACTIVE	\N	2026-03-03 18:25:29.516938+00	2026-03-03 18:25:29.516938+00
31879258-4eca-4392-882f-2a9b44e6910b	0ba24eae-6aef-4010-9a19-d9057cf7bf80	Safety during Fire Fighting CG 2	To consider and report on matters referred by the parent body.	c1000000-0000-0000-0000-000000000001	2024-01-01	2027-12-31	ACTIVE	\N	2026-03-03 18:25:29.516938+00	2026-03-03 18:25:29.516938+00
\.


--
-- Data for Name: document_versions; Type: TABLE DATA; Schema: documents; Owner: isep_app
--

COPY documents.document_versions (version_id, document_id, version_number, minio_object_key, uploaded_by, uploaded_at, change_summary, file_size_bytes, checksum_sha256) FROM stdin;
0043d9ff-a6fb-42f4-89c5-1e38f9f91403	00de7b95-d4ef-4012-8a62-68e93ab79e77	2	documents/00de7b95-d4ef-4012-8a62-68e93ab79e77/version_2_NIST.AI.100-1.pdf	c1000000-0000-0000-0000-000000000001	2026-03-04 05:38:46.905277+00	Upddated Reference Playbook	1924970	7c922ff8e41b7e6ce9da16092499110e6a4734d9adca5824e90a83d8b7d3f3b7
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: documents; Owner: isep_app
--

COPY documents.documents (document_id, meeting_id, agenda_item_id, body_id, document_type, title, source, minio_bucket, minio_object_key, file_name, file_size_bytes, mime_type, checksum_sha256, current_version, status, is_downloadable, metadata, uploaded_by, uploaded_at, created_at, updated_at) FROM stdin;
00de7b95-d4ef-4012-8a62-68e93ab79e77	d862c38d-38e7-4bec-9c65-05cb39dd54c4	880ec93e-096d-4d17-b889-89cd4dbddc0a	\N	REFERENCE	Reference Playbook	INDIA	local	documents/00de7b95-d4ef-4012-8a62-68e93ab79e77/version_2_NIST.AI.100-1.pdf	NIST.AI.100-1.pdf	1924970	application/pdf	7c922ff8e41b7e6ce9da16092499110e6a4734d9adca5824e90a83d8b7d3f3b7	2	ACTIVE	t	{}	c1000000-0000-0000-0000-000000000001	2026-03-04 05:38:46.905277+00	2026-03-04 05:26:49.415748+00	2026-03-04 05:38:46.91319+00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: notifications; Owner: isep_app
--

COPY notifications.notifications (notification_id, recipient_user_id, notification_type, title, message, linked_entity_type, linked_entity_id, is_read, delivered_in_portal_at, delivered_email_at, created_at) FROM stdin;
c2d19ec0-dc78-4cff-92b0-e6b370c10a05	c1000000-0000-0000-0000-000000000001	MEETING_REMINDER	Meeting reminder: MSC 113	MSC 113 starts next week. Please complete your briefing.	\N	\N	f	\N	\N	2026-03-01 10:23:27.252479+00
63009612-251e-4780-a4b9-a4bf8b6cfcec	c1000000-0000-0000-0000-000000000002	MEETING_REMINDER	Meeting reminder: MSC 113	MSC 113 starts next week. Please complete your briefing.	\N	\N	f	\N	\N	2026-03-01 10:23:27.252479+00
7d5ffcc5-5501-4091-8ac2-8ad57fd1c020	c1000000-0000-0000-0000-000000000003	MEETING_REMINDER	Meeting reminder: MSC 113	MSC 113 starts next week. Please complete your briefing.	\N	\N	f	\N	\N	2026-03-01 10:23:27.252479+00
eaaa46e9-3c99-462e-9a3f-7f2f3c0db0cc	c1000000-0000-0000-0000-000000000001	TASK_ASSIGNED	New task assigned	You have been assigned a new task for the upcoming meeting.	\N	\N	f	\N	\N	2026-03-02 10:23:27.252479+00
4c481558-0a75-4c86-a728-a948c2becbef	c1000000-0000-0000-0000-000000000002	TASK_ASSIGNED	New task assigned	You have been assigned a new task for the upcoming meeting.	\N	\N	f	\N	\N	2026-03-02 10:23:27.252479+00
d6a4c68f-c664-4602-92dd-d419f7396cf4	c1000000-0000-0000-0000-000000000001	FEEDBACK_REQUESTED	Feedback requested	Your feedback on agenda item 2 is requested by Friday.	\N	\N	t	\N	\N	2026-02-28 10:23:27.252479+00
99d436f1-c70f-493b-84c0-53a7aae4ae81	c1000000-0000-0000-0000-000000000002	FEEDBACK_REQUESTED	Feedback requested	Your feedback on agenda item 2 is requested by Friday.	\N	\N	t	\N	\N	2026-02-28 10:23:27.252479+00
\.


--
-- Data for Name: paper_approval_stages; Type: TABLE DATA; Schema: workflow; Owner: isep_app
--

COPY workflow.paper_approval_stages (stage_id, paper_id, stage_number, stage_name, approver_user_id, status, acted_at, comments, created_at) FROM stdin;
1d88482e-7357-48df-a374-2bf449eb6c1d	7d5705a0-4fa8-425f-9f61-a53355258581	1	Coordinator	\N	PENDING	\N	\N	2026-03-11 10:23:25.79872+00
1123822b-a218-43a5-9c4b-0f7cd687a7b3	7d5705a0-4fa8-425f-9f61-a53355258581	2	Delegation Leader	\N	PENDING	\N	\N	2026-03-11 10:23:25.801218+00
da63e422-3d41-46cc-9de7-2d67e5088230	7d5705a0-4fa8-425f-9f61-a53355258581	3	Division Head	\N	PENDING	\N	\N	2026-03-11 10:23:25.801268+00
\.


--
-- Data for Name: workflow_instances; Type: TABLE DATA; Schema: workflow; Owner: isep_app
--

COPY workflow.workflow_instances (workflow_id, document_id, workflow_type, current_state, previous_state, initiated_by, initiated_at, completed_at, deadline, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: workflow_transition_logs; Type: TABLE DATA; Schema: workflow; Owner: isep_app
--

COPY workflow.workflow_transition_logs (transition_id, workflow_id, from_state, to_state, triggered_by, trigger_action, comments, transitioned_at) FROM stdin;
\.


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: audit; Owner: isep_app
--

ALTER TABLE ONLY audit.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (audit_id);


--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: collaboration; Owner: isep_app
--

ALTER TABLE ONLY collaboration.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (feedback_id);


--
-- Name: agenda_items agenda_items_pkey; Type: CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.agenda_items
    ADD CONSTRAINT agenda_items_pkey PRIMARY KEY (agenda_item_id);


--
-- Name: international_bodies international_bodies_pkey; Type: CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.international_bodies
    ADD CONSTRAINT international_bodies_pkey PRIMARY KEY (body_id);


--
-- Name: meeting_correspondence_groups meeting_correspondence_groups_pkey; Type: CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_correspondence_groups
    ADD CONSTRAINT meeting_correspondence_groups_pkey PRIMARY KEY (meeting_id, cg_id);


--
-- Name: meeting_interventions meeting_interventions_pkey; Type: CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_interventions
    ADD CONSTRAINT meeting_interventions_pkey PRIMARY KEY (intervention_id);


--
-- Name: meeting_outcomes meeting_outcomes_pkey; Type: CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_outcomes
    ADD CONSTRAINT meeting_outcomes_pkey PRIMARY KEY (outcome_id);


--
-- Name: meeting_participants meeting_participants_meeting_id_user_id_key; Type: CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_participants
    ADD CONSTRAINT meeting_participants_meeting_id_user_id_key UNIQUE (meeting_id, user_id);


--
-- Name: meeting_participants meeting_participants_pkey; Type: CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_participants
    ADD CONSTRAINT meeting_participants_pkey PRIMARY KEY (participant_id);


--
-- Name: meeting_status_history meeting_status_history_pkey; Type: CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_status_history
    ADD CONSTRAINT meeting_status_history_pkey PRIMARY KEY (entry_id);


--
-- Name: meetings meetings_pkey; Type: CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meetings
    ADD CONSTRAINT meetings_pkey PRIMARY KEY (meeting_id);


--
-- Name: papers papers_pkey; Type: CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.papers
    ADD CONSTRAINT papers_pkey PRIMARY KEY (paper_id);


--
-- Name: reference_data reference_data_pkey; Type: CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.reference_data
    ADD CONSTRAINT reference_data_pkey PRIMARY KEY (category, code);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (task_id);


--
-- Name: user_body_assignments user_body_assignments_pkey; Type: CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.user_body_assignments
    ADD CONSTRAINT user_body_assignments_pkey PRIMARY KEY (user_id, body_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_keycloak_id_key; Type: CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.users
    ADD CONSTRAINT users_keycloak_id_key UNIQUE (keycloak_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: cg_members cg_members_cg_id_user_id_key; Type: CONSTRAINT; Schema: correspondence; Owner: isep_app
--

ALTER TABLE ONLY correspondence.cg_members
    ADD CONSTRAINT cg_members_cg_id_user_id_key UNIQUE (cg_id, user_id);


--
-- Name: cg_members cg_members_pkey; Type: CONSTRAINT; Schema: correspondence; Owner: isep_app
--

ALTER TABLE ONLY correspondence.cg_members
    ADD CONSTRAINT cg_members_pkey PRIMARY KEY (cg_member_id);


--
-- Name: correspondence_groups correspondence_groups_pkey; Type: CONSTRAINT; Schema: correspondence; Owner: isep_app
--

ALTER TABLE ONLY correspondence.correspondence_groups
    ADD CONSTRAINT correspondence_groups_pkey PRIMARY KEY (cg_id);


--
-- Name: document_versions document_versions_pkey; Type: CONSTRAINT; Schema: documents; Owner: isep_app
--

ALTER TABLE ONLY documents.document_versions
    ADD CONSTRAINT document_versions_pkey PRIMARY KEY (version_id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: documents; Owner: isep_app
--

ALTER TABLE ONLY documents.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (document_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: notifications; Owner: isep_app
--

ALTER TABLE ONLY notifications.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: paper_approval_stages paper_approval_stages_paper_id_stage_number_key; Type: CONSTRAINT; Schema: workflow; Owner: isep_app
--

ALTER TABLE ONLY workflow.paper_approval_stages
    ADD CONSTRAINT paper_approval_stages_paper_id_stage_number_key UNIQUE (paper_id, stage_number);


--
-- Name: paper_approval_stages paper_approval_stages_pkey; Type: CONSTRAINT; Schema: workflow; Owner: isep_app
--

ALTER TABLE ONLY workflow.paper_approval_stages
    ADD CONSTRAINT paper_approval_stages_pkey PRIMARY KEY (stage_id);


--
-- Name: workflow_instances workflow_instances_pkey; Type: CONSTRAINT; Schema: workflow; Owner: isep_app
--

ALTER TABLE ONLY workflow.workflow_instances
    ADD CONSTRAINT workflow_instances_pkey PRIMARY KEY (workflow_id);


--
-- Name: workflow_transition_logs workflow_transition_logs_pkey; Type: CONSTRAINT; Schema: workflow; Owner: isep_app
--

ALTER TABLE ONLY workflow.workflow_transition_logs
    ADD CONSTRAINT workflow_transition_logs_pkey PRIMARY KEY (transition_id);


--
-- Name: idx_audit_logs_entity; Type: INDEX; Schema: audit; Owner: isep_app
--

CREATE INDEX idx_audit_logs_entity ON audit.audit_logs USING btree (entity_type, entity_id);


--
-- Name: idx_audit_logs_timestamp; Type: INDEX; Schema: audit; Owner: isep_app
--

CREATE INDEX idx_audit_logs_timestamp ON audit.audit_logs USING btree ("timestamp");


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: audit; Owner: isep_app
--

CREATE INDEX idx_audit_logs_user_id ON audit.audit_logs USING btree (user_id);


--
-- Name: idx_feedback_agenda_item_id; Type: INDEX; Schema: collaboration; Owner: isep_app
--

CREATE INDEX idx_feedback_agenda_item_id ON collaboration.feedback USING btree (agenda_item_id);


--
-- Name: idx_feedback_user_id; Type: INDEX; Schema: collaboration; Owner: isep_app
--

CREATE INDEX idx_feedback_user_id ON collaboration.feedback USING btree (user_id);


--
-- Name: idx_agenda_items_assigned_coordinator; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_agenda_items_assigned_coordinator ON core.agenda_items USING btree (assigned_coordinator_id);


--
-- Name: idx_agenda_items_meeting_id; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_agenda_items_meeting_id ON core.agenda_items USING btree (meeting_id);


--
-- Name: idx_meeting_correspondence_groups_cg_id; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_meeting_correspondence_groups_cg_id ON core.meeting_correspondence_groups USING btree (cg_id);


--
-- Name: idx_meeting_correspondence_groups_meeting_id; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_meeting_correspondence_groups_meeting_id ON core.meeting_correspondence_groups USING btree (meeting_id);


--
-- Name: idx_meeting_interventions_agenda; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_meeting_interventions_agenda ON core.meeting_interventions USING btree (agenda_item_id);


--
-- Name: idx_meeting_interventions_meeting; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_meeting_interventions_meeting ON core.meeting_interventions USING btree (meeting_id);


--
-- Name: idx_meeting_outcomes_agenda; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_meeting_outcomes_agenda ON core.meeting_outcomes USING btree (agenda_item_id);


--
-- Name: idx_meeting_outcomes_meeting; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_meeting_outcomes_meeting ON core.meeting_outcomes USING btree (meeting_id);


--
-- Name: idx_meeting_participants_meeting_id; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_meeting_participants_meeting_id ON core.meeting_participants USING btree (meeting_id);


--
-- Name: idx_meeting_participants_user_id; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_meeting_participants_user_id ON core.meeting_participants USING btree (user_id);


--
-- Name: idx_meeting_status_history_changed_at; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_meeting_status_history_changed_at ON core.meeting_status_history USING btree (changed_at);


--
-- Name: idx_meeting_status_history_meeting_id; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_meeting_status_history_meeting_id ON core.meeting_status_history USING btree (meeting_id);


--
-- Name: idx_meetings_body_id; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_meetings_body_id ON core.meetings USING btree (body_id);


--
-- Name: idx_meetings_start_date; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_meetings_start_date ON core.meetings USING btree (start_date);


--
-- Name: idx_meetings_status; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_meetings_status ON core.meetings USING btree (status);


--
-- Name: idx_reference_data_category; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_reference_data_category ON core.reference_data USING btree (category);


--
-- Name: idx_tasks_assigned_to; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_tasks_assigned_to ON core.tasks USING btree (assigned_to);


--
-- Name: idx_tasks_meeting_id; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_tasks_meeting_id ON core.tasks USING btree (meeting_id);


--
-- Name: idx_tasks_status; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_tasks_status ON core.tasks USING btree (status);


--
-- Name: idx_user_body_assignments_body_id; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_user_body_assignments_body_id ON core.user_body_assignments USING btree (body_id);


--
-- Name: idx_user_body_assignments_user_id; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_user_body_assignments_user_id ON core.user_body_assignments USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_users_email ON core.users USING btree (email);


--
-- Name: idx_users_keycloak_id; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_users_keycloak_id ON core.users USING btree (keycloak_id);


--
-- Name: idx_users_system_role; Type: INDEX; Schema: core; Owner: isep_app
--

CREATE INDEX idx_users_system_role ON core.users USING btree (system_role);


--
-- Name: idx_document_versions_document_id; Type: INDEX; Schema: documents; Owner: isep_app
--

CREATE INDEX idx_document_versions_document_id ON documents.document_versions USING btree (document_id);


--
-- Name: idx_documents_agenda_item_id; Type: INDEX; Schema: documents; Owner: isep_app
--

CREATE INDEX idx_documents_agenda_item_id ON documents.documents USING btree (agenda_item_id);


--
-- Name: idx_documents_checksum; Type: INDEX; Schema: documents; Owner: isep_app
--

CREATE INDEX idx_documents_checksum ON documents.documents USING btree (checksum_sha256);


--
-- Name: idx_documents_meeting_id; Type: INDEX; Schema: documents; Owner: isep_app
--

CREATE INDEX idx_documents_meeting_id ON documents.documents USING btree (meeting_id);


--
-- Name: idx_documents_metadata; Type: INDEX; Schema: documents; Owner: isep_app
--

CREATE INDEX idx_documents_metadata ON documents.documents USING gin (metadata);


--
-- Name: idx_documents_status; Type: INDEX; Schema: documents; Owner: isep_app
--

CREATE INDEX idx_documents_status ON documents.documents USING btree (status);


--
-- Name: idx_notifications_is_read; Type: INDEX; Schema: notifications; Owner: isep_app
--

CREATE INDEX idx_notifications_is_read ON notifications.notifications USING btree (is_read);


--
-- Name: idx_notifications_recipient; Type: INDEX; Schema: notifications; Owner: isep_app
--

CREATE INDEX idx_notifications_recipient ON notifications.notifications USING btree (recipient_user_id);


--
-- Name: idx_paper_approval_stages_paper_id; Type: INDEX; Schema: workflow; Owner: isep_app
--

CREATE INDEX idx_paper_approval_stages_paper_id ON workflow.paper_approval_stages USING btree (paper_id);


--
-- Name: idx_workflow_transition_logs_workflow_id; Type: INDEX; Schema: workflow; Owner: isep_app
--

CREATE INDEX idx_workflow_transition_logs_workflow_id ON workflow.workflow_transition_logs USING btree (workflow_id);


--
-- Name: feedback feedback_agenda_item_id_fkey; Type: FK CONSTRAINT; Schema: collaboration; Owner: isep_app
--

ALTER TABLE ONLY collaboration.feedback
    ADD CONSTRAINT feedback_agenda_item_id_fkey FOREIGN KEY (agenda_item_id) REFERENCES core.agenda_items(agenda_item_id);


--
-- Name: feedback feedback_document_id_fkey; Type: FK CONSTRAINT; Schema: collaboration; Owner: isep_app
--

ALTER TABLE ONLY collaboration.feedback
    ADD CONSTRAINT feedback_document_id_fkey FOREIGN KEY (document_id) REFERENCES documents.documents(document_id);


--
-- Name: feedback feedback_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: collaboration; Owner: isep_app
--

ALTER TABLE ONLY collaboration.feedback
    ADD CONSTRAINT feedback_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES core.users(user_id);


--
-- Name: feedback feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: collaboration; Owner: isep_app
--

ALTER TABLE ONLY collaboration.feedback
    ADD CONSTRAINT feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES core.users(user_id);


--
-- Name: agenda_items agenda_items_assigned_coordinator_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.agenda_items
    ADD CONSTRAINT agenda_items_assigned_coordinator_id_fkey FOREIGN KEY (assigned_coordinator_id) REFERENCES core.users(user_id);


--
-- Name: agenda_items agenda_items_meeting_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.agenda_items
    ADD CONSTRAINT agenda_items_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES core.meetings(meeting_id);


--
-- Name: international_bodies international_bodies_parent_body_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.international_bodies
    ADD CONSTRAINT international_bodies_parent_body_id_fkey FOREIGN KEY (parent_body_id) REFERENCES core.international_bodies(body_id);


--
-- Name: meeting_correspondence_groups meeting_correspondence_groups_cg_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_correspondence_groups
    ADD CONSTRAINT meeting_correspondence_groups_cg_id_fkey FOREIGN KEY (cg_id) REFERENCES correspondence.correspondence_groups(cg_id) ON DELETE CASCADE;


--
-- Name: meeting_correspondence_groups meeting_correspondence_groups_meeting_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_correspondence_groups
    ADD CONSTRAINT meeting_correspondence_groups_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES core.meetings(meeting_id) ON DELETE CASCADE;


--
-- Name: meeting_interventions meeting_interventions_agenda_item_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_interventions
    ADD CONSTRAINT meeting_interventions_agenda_item_id_fkey FOREIGN KEY (agenda_item_id) REFERENCES core.agenda_items(agenda_item_id) ON DELETE CASCADE;


--
-- Name: meeting_interventions meeting_interventions_delivered_by_user_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_interventions
    ADD CONSTRAINT meeting_interventions_delivered_by_user_id_fkey FOREIGN KEY (delivered_by_user_id) REFERENCES core.users(user_id);


--
-- Name: meeting_interventions meeting_interventions_meeting_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_interventions
    ADD CONSTRAINT meeting_interventions_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES core.meetings(meeting_id) ON DELETE CASCADE;


--
-- Name: meeting_outcomes meeting_outcomes_agenda_item_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_outcomes
    ADD CONSTRAINT meeting_outcomes_agenda_item_id_fkey FOREIGN KEY (agenda_item_id) REFERENCES core.agenda_items(agenda_item_id) ON DELETE CASCADE;


--
-- Name: meeting_outcomes meeting_outcomes_captured_by_user_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_outcomes
    ADD CONSTRAINT meeting_outcomes_captured_by_user_id_fkey FOREIGN KEY (captured_by_user_id) REFERENCES core.users(user_id);


--
-- Name: meeting_outcomes meeting_outcomes_meeting_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_outcomes
    ADD CONSTRAINT meeting_outcomes_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES core.meetings(meeting_id) ON DELETE CASCADE;


--
-- Name: meeting_participants meeting_participants_assigned_by_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_participants
    ADD CONSTRAINT meeting_participants_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES core.users(user_id);


--
-- Name: meeting_participants meeting_participants_meeting_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_participants
    ADD CONSTRAINT meeting_participants_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES core.meetings(meeting_id);


--
-- Name: meeting_participants meeting_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_participants
    ADD CONSTRAINT meeting_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES core.users(user_id);


--
-- Name: meeting_status_history meeting_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_status_history
    ADD CONSTRAINT meeting_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES core.users(user_id);


--
-- Name: meeting_status_history meeting_status_history_meeting_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meeting_status_history
    ADD CONSTRAINT meeting_status_history_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES core.meetings(meeting_id) ON DELETE CASCADE;


--
-- Name: meetings meetings_body_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meetings
    ADD CONSTRAINT meetings_body_id_fkey FOREIGN KEY (body_id) REFERENCES core.international_bodies(body_id);


--
-- Name: meetings meetings_created_by_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.meetings
    ADD CONSTRAINT meetings_created_by_fkey FOREIGN KEY (created_by) REFERENCES core.users(user_id);


--
-- Name: papers papers_agenda_item_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.papers
    ADD CONSTRAINT papers_agenda_item_id_fkey FOREIGN KEY (agenda_item_id) REFERENCES core.agenda_items(agenda_item_id);


--
-- Name: papers papers_meeting_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.papers
    ADD CONSTRAINT papers_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES core.meetings(meeting_id);


--
-- Name: tasks tasks_agenda_item_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.tasks
    ADD CONSTRAINT tasks_agenda_item_id_fkey FOREIGN KEY (agenda_item_id) REFERENCES core.agenda_items(agenda_item_id);


--
-- Name: tasks tasks_assigned_by_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.tasks
    ADD CONSTRAINT tasks_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES core.users(user_id);


--
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES core.users(user_id);


--
-- Name: tasks tasks_document_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.tasks
    ADD CONSTRAINT tasks_document_id_fkey FOREIGN KEY (document_id) REFERENCES documents.documents(document_id);


--
-- Name: tasks tasks_meeting_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.tasks
    ADD CONSTRAINT tasks_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES core.meetings(meeting_id);


--
-- Name: user_body_assignments user_body_assignments_body_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.user_body_assignments
    ADD CONSTRAINT user_body_assignments_body_id_fkey FOREIGN KEY (body_id) REFERENCES core.international_bodies(body_id) ON DELETE CASCADE;


--
-- Name: user_body_assignments user_body_assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.user_body_assignments
    ADD CONSTRAINT user_body_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES core.users(user_id) ON DELETE CASCADE;


--
-- Name: users users_created_by_fkey; Type: FK CONSTRAINT; Schema: core; Owner: isep_app
--

ALTER TABLE ONLY core.users
    ADD CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES core.users(user_id);


--
-- Name: cg_members cg_members_cg_id_fkey; Type: FK CONSTRAINT; Schema: correspondence; Owner: isep_app
--

ALTER TABLE ONLY correspondence.cg_members
    ADD CONSTRAINT cg_members_cg_id_fkey FOREIGN KEY (cg_id) REFERENCES correspondence.correspondence_groups(cg_id);


--
-- Name: cg_members cg_members_user_id_fkey; Type: FK CONSTRAINT; Schema: correspondence; Owner: isep_app
--

ALTER TABLE ONLY correspondence.cg_members
    ADD CONSTRAINT cg_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES core.users(user_id);


--
-- Name: correspondence_groups correspondence_groups_india_lead_id_fkey; Type: FK CONSTRAINT; Schema: correspondence; Owner: isep_app
--

ALTER TABLE ONLY correspondence.correspondence_groups
    ADD CONSTRAINT correspondence_groups_india_lead_id_fkey FOREIGN KEY (india_lead_id) REFERENCES core.users(user_id);


--
-- Name: correspondence_groups correspondence_groups_parent_body_id_fkey; Type: FK CONSTRAINT; Schema: correspondence; Owner: isep_app
--

ALTER TABLE ONLY correspondence.correspondence_groups
    ADD CONSTRAINT correspondence_groups_parent_body_id_fkey FOREIGN KEY (parent_body_id) REFERENCES core.international_bodies(body_id);


--
-- Name: document_versions document_versions_document_id_fkey; Type: FK CONSTRAINT; Schema: documents; Owner: isep_app
--

ALTER TABLE ONLY documents.document_versions
    ADD CONSTRAINT document_versions_document_id_fkey FOREIGN KEY (document_id) REFERENCES documents.documents(document_id);


--
-- Name: document_versions document_versions_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: documents; Owner: isep_app
--

ALTER TABLE ONLY documents.document_versions
    ADD CONSTRAINT document_versions_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES core.users(user_id);


--
-- Name: documents documents_agenda_item_id_fkey; Type: FK CONSTRAINT; Schema: documents; Owner: isep_app
--

ALTER TABLE ONLY documents.documents
    ADD CONSTRAINT documents_agenda_item_id_fkey FOREIGN KEY (agenda_item_id) REFERENCES core.agenda_items(agenda_item_id);


--
-- Name: documents documents_body_id_fkey; Type: FK CONSTRAINT; Schema: documents; Owner: isep_app
--

ALTER TABLE ONLY documents.documents
    ADD CONSTRAINT documents_body_id_fkey FOREIGN KEY (body_id) REFERENCES core.international_bodies(body_id);


--
-- Name: documents documents_meeting_id_fkey; Type: FK CONSTRAINT; Schema: documents; Owner: isep_app
--

ALTER TABLE ONLY documents.documents
    ADD CONSTRAINT documents_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES core.meetings(meeting_id);


--
-- Name: documents documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: documents; Owner: isep_app
--

ALTER TABLE ONLY documents.documents
    ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES core.users(user_id);


--
-- Name: notifications notifications_recipient_user_id_fkey; Type: FK CONSTRAINT; Schema: notifications; Owner: isep_app
--

ALTER TABLE ONLY notifications.notifications
    ADD CONSTRAINT notifications_recipient_user_id_fkey FOREIGN KEY (recipient_user_id) REFERENCES core.users(user_id);


--
-- Name: paper_approval_stages paper_approval_stages_approver_user_id_fkey; Type: FK CONSTRAINT; Schema: workflow; Owner: isep_app
--

ALTER TABLE ONLY workflow.paper_approval_stages
    ADD CONSTRAINT paper_approval_stages_approver_user_id_fkey FOREIGN KEY (approver_user_id) REFERENCES core.users(user_id);


--
-- Name: paper_approval_stages paper_approval_stages_paper_id_fkey; Type: FK CONSTRAINT; Schema: workflow; Owner: isep_app
--

ALTER TABLE ONLY workflow.paper_approval_stages
    ADD CONSTRAINT paper_approval_stages_paper_id_fkey FOREIGN KEY (paper_id) REFERENCES core.papers(paper_id) ON DELETE CASCADE;


--
-- Name: workflow_instances workflow_instances_document_id_fkey; Type: FK CONSTRAINT; Schema: workflow; Owner: isep_app
--

ALTER TABLE ONLY workflow.workflow_instances
    ADD CONSTRAINT workflow_instances_document_id_fkey FOREIGN KEY (document_id) REFERENCES documents.documents(document_id);


--
-- Name: workflow_instances workflow_instances_initiated_by_fkey; Type: FK CONSTRAINT; Schema: workflow; Owner: isep_app
--

ALTER TABLE ONLY workflow.workflow_instances
    ADD CONSTRAINT workflow_instances_initiated_by_fkey FOREIGN KEY (initiated_by) REFERENCES core.users(user_id);


--
-- Name: workflow_transition_logs workflow_transition_logs_triggered_by_fkey; Type: FK CONSTRAINT; Schema: workflow; Owner: isep_app
--

ALTER TABLE ONLY workflow.workflow_transition_logs
    ADD CONSTRAINT workflow_transition_logs_triggered_by_fkey FOREIGN KEY (triggered_by) REFERENCES core.users(user_id);


--
-- Name: workflow_transition_logs workflow_transition_logs_workflow_id_fkey; Type: FK CONSTRAINT; Schema: workflow; Owner: isep_app
--

ALTER TABLE ONLY workflow.workflow_transition_logs
    ADD CONSTRAINT workflow_transition_logs_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES workflow.workflow_instances(workflow_id);


--
-- Name: audit_logs audit_insert_only; Type: POLICY; Schema: audit; Owner: isep_app
--

CREATE POLICY audit_insert_only ON audit.audit_logs FOR INSERT WITH CHECK (true);


--
-- Name: audit_logs; Type: ROW SECURITY; Schema: audit; Owner: isep_app
--

ALTER TABLE audit.audit_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_logs audit_select; Type: POLICY; Schema: audit; Owner: isep_app
--

CREATE POLICY audit_select ON audit.audit_logs FOR SELECT USING (true);


--
-- PostgreSQL database dump complete
--

\unrestrict aRY0a7NIvvfoRoB71gWQOJPVlbgEDha4uMumvZkF29aagpFxvYZg0ucvDO0kb3q

