# Supabase Setup Instructions

## Prerequisites
Your Supabase database should already have the tables created using the SQL schema you provided.

## Configuration Steps

### 1. Update Environment Variables

Edit the `.env` file in the project root with your Supabase credentials:

```bash
REACT_APP_SUPABASE_URL=your_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_public_key_here
```

Replace:
- `your_project_url_here` with your actual Supabase Project URL
- `your_anon_public_key_here` with your actual anon public key

**Note:** Do NOT use the service_role key in the mobile app. The service_role key should only be used on the backend/server.

### 2. Set Up Authentication in Supabase

Since the mobile app authenticates workers using email/password, you need to set up users in Supabase Auth:

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Users
3. For each worker in your `workers` table, create a corresponding user:
   - Click "Add user"
   - Use the same email as in the workers table
   - Set a password
   - Confirm the user (disable email confirmation if needed for testing)

**Important:** The email in Supabase Auth must match the email in the `workers` table.

### 3. Set Up Storage Bucket (Optional - for photo uploads)

If you want to enable photo uploads:

1. Go to Storage in your Supabase Dashboard
2. Create a new bucket called `photos`
3. Set the bucket to "Public" if you want photos to be publicly accessible
4. Configure policies:

```sql
-- Allow authenticated users to upload photos
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'photos');

-- Allow public to view photos
CREATE POLICY "Allow public to view photos" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'photos');
```

### 4. Configure Row Level Security (RLS) Policies

Add these policies to ensure workers can only see their assigned work orders:

```sql
-- Enable RLS on work_orders table
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Workers can view their assigned work orders
CREATE POLICY "Workers can view assigned work orders" ON work_orders
  FOR SELECT
  TO authenticated
  USING (
    assigned_worker IN (
      SELECT id FROM workers WHERE email = auth.email()
    )
  );

-- Policy: Workers can update their assigned work orders
CREATE POLICY "Workers can update assigned work orders" ON work_orders
  FOR UPDATE
  TO authenticated
  USING (
    assigned_worker IN (
      SELECT id FROM workers WHERE email = auth.email()
    )
  )
  WITH CHECK (
    assigned_worker IN (
      SELECT id FROM workers WHERE email = auth.email()
    )
  );

-- Enable RLS on workers table
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Policy: Workers can view their own profile
CREATE POLICY "Workers can view own profile" ON workers
  FOR SELECT
  TO authenticated
  USING (email = auth.email());
```

### 5. Insert Sample Data (Optional - for testing)

If you want to test with sample data:

```sql
-- Insert sample workers
INSERT INTO workers (employee_id, name, email, phone, skills, hourly_rate, availability)
VALUES
  ('EMP001', 'John Smith', 'john@example.com', '555-0101', '["plumbing", "electrical"]', 50.00, 'full-time'),
  ('EMP002', 'Jane Doe', 'jane@example.com', '555-0102', '["carpentry", "painting"]', 45.00, 'full-time');

-- Insert sample work orders (replace worker_id with actual UUID from workers table)
INSERT INTO work_orders (
  title,
  description,
  customer_name,
  customer_email,
  customer_phone,
  address,
  priority,
  status,
  assigned_worker,
  estimated_hours,
  scheduled_date
)
VALUES (
  'Kitchen Sink Repair',
  'Fix leaking kitchen sink and replace faucet',
  'Bob Johnson',
  'bob@example.com',
  '555-1234',
  '123 Main St, Anytown, USA',
  'high',
  'assigned',
  (SELECT id FROM workers WHERE email = 'john@example.com'),
  3.5,
  NOW() + INTERVAL '1 day'
);
```

### 6. Start the Application

```bash
npm start
```

### 7. Test the Login

Try logging in with one of the worker email addresses and the password you set in Supabase Auth.

## Troubleshooting

### Authentication Issues
- Verify that the email in Supabase Auth matches the email in the workers table
- Check that the user is confirmed in Supabase Auth
- Verify the Supabase URL and anon key are correct in `.env`

### No Work Orders Showing
- Check RLS policies are set up correctly
- Verify work orders are assigned to the logged-in worker's ID
- Check the browser console for any errors

### Photo Upload Issues
- Verify the `photos` storage bucket exists and is public
- Check that storage policies allow authenticated users to upload
- Ensure the bucket name in the code matches your bucket name

## Security Notes

1. **Never commit the `.env` file** - Add it to `.gitignore`
2. **Never use the service_role key in the frontend** - Only use the anon public key
3. **Always use RLS policies** to protect your data
4. For production, consider additional security measures:
   - Rate limiting
   - Additional authentication flows
   - Monitoring and logging
