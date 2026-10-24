-- 0002: Replace the generic JSON blob store (`documents`) with normalized tables.
-- One table per concept, typed columns, foreign keys, real indexes.
-- The client-facing /api/db/* document API is unchanged; src/worker/db.ts maps it onto these tables.

-- Legacy alias of the latest payment state cached on the member row so the
-- directory/overview lists never have to fan out to `payments`. Maintained by
-- the worker; the source of truth for transactions is the `payments` table.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS members (
  id                  TEXT PRIMARY KEY,
  form_no             TEXT NOT NULL,
  membership_id       TEXT,
  membership_type     TEXT NOT NULL DEFAULT 'general',
  status              TEXT NOT NULL DEFAULT 'pending',
  application_date    TEXT,
  applicant_name_en   TEXT NOT NULL DEFAULT '',
  applicant_name_bn   TEXT,
  email               TEXT,
  mobile              TEXT,
  phone               TEXT,
  blood_group         TEXT,
  occupation_category TEXT,
  occupation          TEXT,
  organization_position TEXT,
  session             TEXT,
  batch               TEXT,
  photo_url           TEXT,
  fee_amount          TEXT,
  payment_status      TEXT NOT NULL DEFAULT 'pending',
  payment_method      TEXT,
  sender_number       TEXT,
  trx_number          TEXT,
  payment_receipt_no  TEXT,
  paid_amount         INTEGER,
  paid_at             TEXT,
  extras              TEXT, -- JSON: client fields not mapped to a column (adminNotes, otherOccupation, ...)
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_members_status   ON members (status, created_at);
CREATE INDEX IF NOT EXISTS idx_members_mobile   ON members (mobile);
CREATE INDEX IF NOT EXISTS idx_members_phone    ON members (phone);
CREATE INDEX IF NOT EXISTS idx_members_form_no  ON members (form_no);

CREATE TABLE IF NOT EXISTS member_profiles (
  member_id             TEXT PRIMARY KEY REFERENCES members (id) ON DELETE CASCADE,
  fathers_name          TEXT,
  mothers_name          TEXT,
  date_of_birth         TEXT,
  nid_number            TEXT,
  present_address       TEXT,
  perm_village          TEXT,
  perm_post             TEXT,
  perm_upazila          TEXT,
  perm_district         TEXT,
  signature_url         TEXT,
  signature_name        TEXT,
  degree_doc_url        TEXT,
  degree_doc_name       TEXT,
  declaration_confirmed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS member_degrees (
  member_id    TEXT NOT NULL REFERENCES members (id) ON DELETE CASCADE,
  program      TEXT NOT NULL CHECK (program IN ('bsc', 'msc', 'mphil', 'phd')),
  session      TEXT,
  passing_year TEXT,
  batch        TEXT,
  PRIMARY KEY (member_id, program)
);

CREATE TABLE IF NOT EXISTS payments (
  id            TEXT PRIMARY KEY,
  member_id     TEXT REFERENCES members (id) ON DELETE SET NULL,
  membership_id TEXT,
  receipt_no    TEXT UNIQUE,
  payer_name    TEXT,
  payer_name_bn TEXT,
  phone         TEXT,
  email         TEXT,
  session       TEXT,
  batch         TEXT,
  purpose       TEXT,
  purpose_type  TEXT,
  amount        INTEGER,
  payment_method TEXT,
  sender_number TEXT,
  trx_id        TEXT,
  note          TEXT,
  slip_url      TEXT,
  status        TEXT NOT NULL DEFAULT 'verified',
  extras        TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments (member_id);
CREATE INDEX IF NOT EXISTS idx_payments_trx_id    ON payments (trx_id);
CREATE INDEX IF NOT EXISTS idx_payments_phone     ON payments (phone);
CREATE INDEX IF NOT EXISTS idx_payments_created   ON payments (created_at);

CREATE TABLE IF NOT EXISTS notices (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL DEFAULT '',
  category     TEXT,
  description  TEXT,
  is_urgent    INTEGER NOT NULL DEFAULT 0,
  date_display TEXT,
  image_url    TEXT,
  pdf_url      TEXT,
  pdf_file     TEXT,
  published_at TEXT,
  deleted      INTEGER NOT NULL DEFAULT 0,
  extras       TEXT,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_notices_published ON notices (published_at);

CREATE TABLE IF NOT EXISTS news (
  id          TEXT PRIMARY KEY,
  title_bn    TEXT,
  title_en    TEXT,
  category    TEXT,
  category_bn TEXT,
  category_en TEXT,
  image_url   TEXT,
  date        TEXT,
  author_bn   TEXT,
  author_en   TEXT,
  summary_bn  TEXT,
  summary_en  TEXT,
  content_bn  TEXT,
  content_en  TEXT,
  is_featured INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  extras      TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_news_created ON news (created_at);

CREATE TABLE IF NOT EXISTS contacts (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  phone      TEXT,
  email      TEXT,
  subject    TEXT,
  message    TEXT,
  status     TEXT NOT NULL DEFAULT 'unread',
  extras     TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts (created_at);

CREATE TABLE IF NOT EXISTS feedback_messages (
  id             TEXT PRIMARY KEY,
  sender_name    TEXT,
  sender_batch   TEXT,
  sender_contact TEXT,
  category       TEXT,
  subject        TEXT,
  message        TEXT,
  status         TEXT NOT NULL DEFAULT 'unread',
  extras         TEXT,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback_messages (created_at);

-- Generic key/value store for admin-editable JSON config documents
-- (site_settings/community_stats, settings/email_config, ...).
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL, -- JSON
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

/* ------------------------------------------------------------ legacy copy */
-- Copy the (test) rows out of the old document store, then drop it.

INSERT INTO members (id, form_no, membership_id, membership_type, status, application_date,
                     applicant_name_en, applicant_name_bn, email, mobile, phone, blood_group,
                     occupation_category, occupation, organization_position, session, batch,
                     photo_url, fee_amount, payment_status, payment_method, sender_number,
                     trx_number, payment_receipt_no, paid_amount, paid_at, extras, created_at, updated_at)
SELECT id,
       COALESCE(json_extract(data, '$.formNo'), json_extract(data, '$.membershipId'), ''),
       json_extract(data, '$.membershipId'),
       COALESCE(json_extract(data, '$.membershipType'), 'general'),
       COALESCE(json_extract(data, '$.status'), 'pending'),
       json_extract(data, '$.applicationDate'),
       COALESCE(json_extract(data, '$.applicantNameEn'), json_extract(data, '$.fullName'), ''),
       json_extract(data, '$.applicantNameBn'),
       json_extract(data, '$.email'),
       json_extract(data, '$.mobile'),
       json_extract(data, '$.phone'),
       json_extract(data, '$.bloodGroup'),
       json_extract(data, '$.occupationCategory'),
       json_extract(data, '$.occupation'),
       json_extract(data, '$.organizationPosition'),
       json_extract(data, '$.session'),
       json_extract(data, '$.batch'),
       json_extract(data, '$.userPhotoUrl'),
       json_extract(data, '$.feeAmount'),
       COALESCE(json_extract(data, '$.paymentStatus'), 'pending'),
       json_extract(data, '$.paymentMethod'),
       json_extract(data, '$.senderNumber'),
       json_extract(data, '$.transactionId'),
       json_extract(data, '$.paymentReceiptNo'),
       CASE WHEN json_type(data, '$.paidAmount') IN ('integer', 'real')
            THEN CAST(json_extract(data, '$.paidAmount') AS INTEGER) END,
       json_extract(data, '$.paidAt'),
       '{}',
       COALESCE(json_extract(data, '$.createdAt'), created_at),
       updated_at
  FROM documents
 WHERE collection = 'memberships';

INSERT INTO member_profiles (member_id, fathers_name, mothers_name, date_of_birth, nid_number,
                             present_address, perm_village, perm_post, perm_upazila, perm_district,
                             signature_url, signature_name, degree_doc_url, degree_doc_name,
                             declaration_confirmed)
SELECT id,
       json_extract(data, '$.fathersName'),
       json_extract(data, '$.mothersName'),
       json_extract(data, '$.dateOfBirth'),
       json_extract(data, '$.nidNumber'),
       json_extract(data, '$.presentAddress'),
       json_extract(data, '$.permVillage'),
       json_extract(data, '$.permPost'),
       json_extract(data, '$.permUpazila'),
       json_extract(data, '$.permDistrict'),
       json_extract(data, '$.signatureDataUrl'),
       json_extract(data, '$.signatureName'),
       COALESCE(json_extract(data, '$.degreeDocUrl'), json_extract(data, '$.degreeDocData')),
       json_extract(data, '$.degreeDocName'),
       COALESCE(json_extract(data, '$.declarationConfirmed'), 0)
  FROM documents
 WHERE collection = 'memberships';

INSERT INTO member_degrees (member_id, program, session, passing_year, batch)
SELECT id, 'bsc', json_extract(data, '$.bscSession'), json_extract(data, '$.bscYear'), json_extract(data, '$.bscBatch')
  FROM documents
 WHERE collection = 'memberships'
   AND json_extract(data, '$.bscSession') IS NOT NULL AND json_extract(data, '$.bscSession') <> ''
UNION ALL
SELECT id, 'msc', json_extract(data, '$.mscSession'), json_extract(data, '$.mscYear'), json_extract(data, '$.mscBatch')
  FROM documents
 WHERE collection = 'memberships'
   AND json_extract(data, '$.mscSession') IS NOT NULL AND json_extract(data, '$.mscSession') <> ''
UNION ALL
SELECT id, 'mphil', NULL, json_extract(data, '$.mphilYear'), NULL
  FROM documents
 WHERE collection = 'memberships'
   AND json_extract(data, '$.mphilYear') IS NOT NULL AND json_extract(data, '$.mphilYear') <> ''
UNION ALL
SELECT id, 'phd', NULL, json_extract(data, '$.phdYear'), NULL
  FROM documents
 WHERE collection = 'memberships'
   AND json_extract(data, '$.phdYear') IS NOT NULL AND json_extract(data, '$.phdYear') <> '';

INSERT INTO payments (id, member_id, membership_id, receipt_no, payer_name, payer_name_bn,
                      phone, email, session, batch, purpose, purpose_type, amount,
                      payment_method, sender_number, trx_id, note, slip_url, status,
                      created_at, updated_at)
SELECT d.id,
       (SELECT m.id FROM members m WHERE m.id = json_extract(d.data, '$.membershipId')),
       json_extract(d.data, '$.membershipId'),
       json_extract(d.data, '$.receiptNo'),
       json_extract(d.data, '$.payerName'),
       json_extract(d.data, '$.payerNameBn'),
       json_extract(d.data, '$.phone'),
       json_extract(d.data, '$.email'),
       json_extract(d.data, '$.session'),
       json_extract(d.data, '$.batch'),
       json_extract(d.data, '$.purpose'),
       json_extract(d.data, '$.purposeType'),
       CASE WHEN json_type(d.data, '$.amount') IN ('integer', 'real')
            THEN CAST(json_extract(d.data, '$.amount') AS INTEGER) END,
       json_extract(d.data, '$.paymentMethod'),
       json_extract(d.data, '$.senderNumber'),
       json_extract(d.data, '$.transactionId'),
       json_extract(d.data, '$.note'),
       json_extract(d.data, '$.slipUrl'),
       COALESCE(json_extract(d.data, '$.status'), 'verified'),
       COALESCE(json_extract(d.data, '$.createdAt'), d.created_at),
       d.updated_at
  FROM documents d
 WHERE d.collection = 'payments';

INSERT INTO notices (id, title, category, description, is_urgent, date_display, image_url,
                     pdf_url, pdf_file, published_at, deleted, extras, created_at, updated_at)
SELECT id,
       COALESCE(json_extract(data, '$.title'), ''),
       json_extract(data, '$.category'),
       json_extract(data, '$.description'),
       COALESCE(json_extract(data, '$.isUrgent'), 0),
       json_extract(data, '$.date'),
       json_extract(data, '$.imageUrl'),
       json_extract(data, '$.pdfUrl'),
       json_extract(data, '$.pdfFileName'),
       COALESCE(json_extract(data, '$.createdAt'), created_at),
       COALESCE(json_extract(data, '$.deleted'), 0),
       '{}',
       created_at,
       updated_at
  FROM documents
 WHERE collection = 'notices';

INSERT INTO news (id, title_bn, title_en, category, category_bn, category_en, image_url, date,
                  author_bn, author_en, summary_bn, summary_en, content_bn, content_en,
                  is_featured, views_count, extras, created_at, updated_at)
SELECT id,
       json_extract(data, '$.titleBn'),
       json_extract(data, '$.titleEn'),
       json_extract(data, '$.category'),
       json_extract(data, '$.categoryBn'),
       json_extract(data, '$.categoryEn'),
       json_extract(data, '$.imageUrl'),
       json_extract(data, '$.date'),
       json_extract(data, '$.authorBn'),
       json_extract(data, '$.authorEn'),
       json_extract(data, '$.summaryBn'),
       json_extract(data, '$.summaryEn'),
       json_extract(data, '$.contentBn'),
       json_extract(data, '$.contentEn'),
       COALESCE(json_extract(data, '$.isFeatured'), 0),
       COALESCE(CAST(json_extract(data, '$.viewsCount') AS INTEGER), 0),
       '{}',
       updated_at,
       updated_at
  FROM documents
 WHERE collection = 'recent_news';

INSERT INTO contacts (id, name, phone, email, subject, message, status, extras, created_at, updated_at)
SELECT id,
       COALESCE(json_extract(data, '$.name'), ''),
       json_extract(data, '$.phone'),
       json_extract(data, '$.email'),
       json_extract(data, '$.subject'),
       json_extract(data, '$.message'),
       COALESCE(json_extract(data, '$.status'), 'unread'),
       '{}',
       created_at,
       updated_at
  FROM documents
 WHERE collection = 'contacts';

INSERT INTO feedback_messages (id, sender_name, sender_batch, sender_contact, category, subject,
                               message, status, extras, created_at, updated_at)
SELECT id,
       json_extract(data, '$.senderName'),
       json_extract(data, '$.senderBatch'),
       json_extract(data, '$.senderContact'),
       json_extract(data, '$.category'),
       json_extract(data, '$.subject'),
       json_extract(data, '$.message'),
       COALESCE(json_extract(data, '$.status'), 'unread'),
       '{}',
       created_at,
       updated_at
  FROM documents
 WHERE collection = 'feedback_messages';

INSERT INTO settings (key, value, created_at, updated_at)
SELECT 'site_settings/' || id, data, created_at, updated_at FROM documents WHERE collection = 'site_settings'
UNION ALL
SELECT 'settings/' || id, data, created_at, updated_at FROM documents WHERE collection = 'settings';

DROP TABLE documents;
