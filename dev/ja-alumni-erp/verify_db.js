
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ewimbmnlbtoqeycnvqhx.supabase.co';
// Using the JWT from SUPABASE_SETUP.md (Item 13) which appears to be the valid Anon key
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3aW1ibW5sYnRvcWV5Y252cWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDAzMzYsImV4cCI6MjA4NTc3NjMzNn0.1nEmrdhzunbvB5qmKodWsF1hVntdxMr3LdamY-Ucp5w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking connection with JWT...");
    // Try to select evenements (publicly visible) to verify connection and table existence
    const { data, error } = await supabase.from('evenements').select('count', { count: 'exact', head: true });

    if (error) {
        console.error("Error connecting:", JSON.stringify(error, null, 2));
        if (error.code === '42P01') {
            console.log("VERIFICATION_RESULT: FAILED (Table 'evenements' Missing)");
        } else {
            console.log("VERIFICATION_RESULT: ERROR (" + error.code + ")");
        }
    } else {
        console.log("Connection successful. Table 'evenements' exists.");

        // Also check profiles (might return error or 0 count due to RLS, but if table is missing it's 42P01)
        const p = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        if (p.error) {
            if (p.error.code === '42P01') {
                console.log("VERIFICATION_RESULT: FAILED (Table 'profiles' Missing)");
            } else {
                console.log("Profiles check: " + p.error.code + " (Expected if RLS blocks anon)");
                console.log("VERIFICATION_RESULT: SUCCESS (Tables exist, RLS active)");
            }
        } else {
            console.log("Profiles check: Accessible");
            console.log("VERIFICATION_RESULT: SUCCESS");
        }
    }
}

check();
