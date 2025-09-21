# User Roles Setup Instructions

## Problem
You're getting this error when trying to fetch user roles:
```
{code: 'PGRST202', details: 'Searched for the function public.get_user_role with parameters user_uuid, but no matches were found in the schema cache.', hint: null, message: 'Could not find the function public.get_user_role(user_uuid) in the schema cache'}
```

## Solution
The error occurs because the `user_roles` table and `get_user_role` function don't exist in your database yet. Here's how to fix it:

### Step 1: Run the Database Setup Script

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `setup_user_roles.sql` (located in the project root)
4. Click "Run" to execute the script

### Step 2: Update Admin User ID (Optional)

The script currently sets the admin role for user ID `'18e1814c-67e4-4e92-9a97-300dfc8082df'`. If this is not your admin user ID:

1. Find your actual user ID from the Supabase Auth dashboard
2. Update the INSERT statement in the script:
   ```sql
   INSERT INTO user_roles (user_id, role, created_by) 
   VALUES ('YOUR_ACTUAL_USER_ID', 'admin', 'YOUR_ACTUAL_USER_ID')
   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
   ```
3. Run the updated script

### Step 3: Test the System

After running the script:

1. Refresh your application
2. Log in with your admin account
3. The role fetching should now work without errors
4. You should be able to access the Admin page

## What the Setup Script Creates

### Database Table: `user_roles`
- Stores user role assignments (admin, user, moderator, etc.)
- Automatically assigns 'user' role to new users
- Has proper Row Level Security (RLS) policies

### Database Functions:
- `get_user_role(user_uuid)`: Fetches a user's role
- `set_user_role(target_user_id, new_role)`: Allows admins to set roles
- `handle_new_user()`: Trigger function for new user role assignment

### Security Features:
- RLS policies ensure users can only see their own roles
- Only admins can view and modify all roles
- Automatic role assignment for new users

## Code Changes Made

### AuthContext Improvements:
- Simplified role fetching logic
- Better error handling
- Removed complex timeout mechanisms
- Graceful fallback to temporary admin detection

## Troubleshooting

### If you still get errors after setup:
1. Check that the script ran successfully (no red error messages)
2. Verify the `user_roles` table exists in your database
3. Check that your user ID is correctly set as admin in the table
4. Look at the browser console for detailed error messages

### To manually check your setup:
```sql
-- Check if table exists
SELECT * FROM user_roles;

-- Check your user's role (replace with your user ID)
SELECT * FROM user_roles WHERE user_id = 'your-user-id';

-- Test the function (replace with your user ID)
SELECT get_user_role('your-user-id');
```

### To manually set yourself as admin:
```sql
INSERT INTO user_roles (user_id, role) 
VALUES ('your-user-id', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

## Future Improvements

Once this is working, you can:
- Remove the temporary hardcoded admin user ID from AuthContext
- Add more roles (moderator, etc.)
- Create an admin interface to manage user roles
- Add role-based permissions throughout the app


