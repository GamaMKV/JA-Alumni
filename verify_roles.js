
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ewimbmnlbtoqeycnvqhx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3aW1ibW5sYnRvcWV5Y252cWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDAzMzYsImV4cCI6MjA4NTc3NjMzNn0.1nEmrdhzunbvB5qmKodWsF1hVntdxMr3LdamY-Ucp5w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRoles() {
    console.log("Checking user_role enum...");

    // We can't easily select FROM pg_enum via Supabase JS client without RPC or specialized setup.
    // Instead, we'll try to insert a fake user with a test role to see the error message listing allowed values, 
    // OR we can check if there are profiles with 'COPIL' etc.

    const { data, error } = await supabase
        .from('profiles')
        .select('statut')
        .limit(100);

    if (error) {
        console.error("Error fetching profiles:", error);
    } else {
        const roles = [...new Set(data.map(p => p.statut))];
        console.log("Found roles in use:", roles);
    }
}

checkRoles();
