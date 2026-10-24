-- Seed a sample registration (member) entry.
-- Run locally:   npm run db:seed:local
-- Run remote:    npm run db:seed:remote
-- Idempotent: re-running replaces the seed row (profiles/degrees cascade on delete).

INSERT INTO members (
  id, form_no, membership_id, membership_type, status, application_date,
  applicant_name_en, applicant_name_bn, email, mobile, blood_group,
  occupation_category, occupation, organization_position, session, batch,
  fee_amount, payment_status, payment_method, sender_number, trx_number,
  payment_receipt_no, paid_amount, paid_at
) VALUES (
  'seed-member-001',          -- id
  'BAAJNU-2024-001',          -- form_no
  'BAAJNU-2024-001',          -- membership_id
  'general',                  -- membership_type
  'pending',                  -- status
  '2024-01-15',               -- application_date
  'Test Alumni',              -- applicant_name_en
  'টেস্ট অ্যালামনাই',          -- applicant_name_bn
  'test.alumni@example.com',  -- email
  '01712345678',              -- mobile
  'A+',                       -- blood_group
  'service',                  -- occupation_category
  'Government Service',       -- occupation
  'Assistant Director',       -- organization_position
  '2013-14',                  -- session
  '2016',                     -- batch
  '500',                      -- fee_amount
  'unpaid',                   -- payment_status
  'bkash',                    -- payment_method
  '01712345678',              -- sender_number
  'SEEDTRX0001',              -- trx_number
  'SEEDRCP0001',              -- payment_receipt_no
  500,                        -- paid_amount
  '2024-01-15T10:00:00.000Z'  -- paid_at
) ON CONFLICT (id) DO UPDATE SET
  form_no            = excluded.form_no,
  membership_id      = excluded.membership_id,
  status             = excluded.status,
  applicant_name_en  = excluded.applicant_name_en,
  applicant_name_bn  = excluded.applicant_name_bn,
  email              = excluded.email,
  mobile             = excluded.mobile,
  blood_group        = excluded.blood_group,
  fee_amount         = excluded.fee_amount,
  payment_status     = excluded.payment_status,
  trx_number         = excluded.trx_number,
  payment_receipt_no = excluded.payment_receipt_no,
  paid_amount        = excluded.paid_amount,
  updated_at         = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));

INSERT INTO member_profiles (
  member_id, fathers_name, mothers_name, date_of_birth, nid_number,
  present_address, perm_village, perm_post, perm_upazila, perm_district,
  declaration_confirmed
) VALUES (
  'seed-member-001',
  'Father Name',
  'Mother Name',
  '1994-05-20',
  '1234567890',
  '12 Test Road, Dhaka',
  'Village Name',
  'Post Name',
  'Test Upazila',
  'Dhaka',
  1
) ON CONFLICT (member_id) DO UPDATE SET
  fathers_name          = excluded.fathers_name,
  mothers_name          = excluded.mothers_name,
  date_of_birth         = excluded.date_of_birth,
  nid_number            = excluded.nid_number,
  present_address       = excluded.present_address,
  perm_village          = excluded.perm_village,
  perm_post             = excluded.perm_post,
  perm_upazila          = excluded.perm_upazila,
  perm_district         = excluded.perm_district,
  declaration_confirmed = excluded.declaration_confirmed;

INSERT INTO member_degrees (member_id, program, session, passing_year, batch)
VALUES ('seed-member-001', 'bsc', '2013-14', '2017', '2016')
ON CONFLICT (member_id, program) DO UPDATE SET
  session       = excluded.session,
  passing_year  = excluded.passing_year,
  batch         = excluded.batch;
