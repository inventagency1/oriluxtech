import { createClient } from '@supabase/supabase-js'

const [emailArg, passwordArg, fullNameArg] = process.argv.slice(2)
const email = emailArg || 'herockudev@gmail.com'
const password = passwordArg || 'admin123'
const fullName = fullNameArg || 'herockudev'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  })

  if (createError || !created?.user?.id) {
    console.error(createError?.message || 'Failed to create user')
    process.exit(1)
  }

  const userId = created.user.id

  await supabase
    .from('profiles')
    .upsert({ user_id: userId, email, full_name: fullName })
    .select()
    .maybeSingle()

  await supabase.rpc('admin_change_user_role', {
    _new_role: 'admin',
    _target_user_id: userId
  })

  console.log(JSON.stringify({ success: true, userId, email, role: 'admin' }))
}

run()