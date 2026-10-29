-- Document store replacing Firestore. One row per document; `data` holds the JSON body.
-- Collections: memberships, payments, contacts, feedback_messages, notices,
--              recent_news, settings, site_settings.
CREATE TABLE IF NOT EXISTS documents (
  collection TEXT NOT NULL,
  id         TEXT NOT NULL,
  data       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (collection, id)
) WITHOUT ROWID;

CREATE INDEX IF NOT EXISTS idx_documents_created ON documents (collection, created_at);

-- Lookup indexes for the fields the public site queries by.
CREATE INDEX IF NOT EXISTS idx_documents_form_no   ON documents (collection, json_extract(data, '$.formNo'));
CREATE INDEX IF NOT EXISTS idx_documents_trx_id    ON documents (collection, json_extract(data, '$.transactionId'));
CREATE INDEX IF NOT EXISTS idx_documents_mobile    ON documents (collection, json_extract(data, '$.mobile'));
CREATE INDEX IF NOT EXISTS idx_documents_phone     ON documents (collection, json_extract(data, '$.phone'));
CREATE INDEX IF NOT EXISTS idx_documents_status    ON documents (collection, json_extract(data, '$.status'));
CREATE INDEX IF NOT EXISTS idx_documents_receipt   ON documents (collection, json_extract(data, '$.receiptNo'));
CREATE INDEX IF NOT EXISTS idx_documents_member_id ON documents (collection, json_extract(data, '$.membershipId'));
