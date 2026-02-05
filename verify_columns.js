
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ewimbmnlbtoqeycnvqhx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3aW1ibW5sYnRvcWV5Y252cWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDAzMzYsImV4cCI6MjA4NTc3NjMzNn0.1nEmrdhzunbvB5qmKodWsF1hVntdxMr3LdamY-Ucp5w';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyColumns() {
    console.log("Checking for 'mini_entreprise_annee' column...");

    // Attempt to select the specific column. 
    // If it doesn't exist, Supabase/Postgres will throw code 42703.
    const { data, error } = await supabase
        .from('profiles')
        .select('mini_entreprise_annee')
        .limit(1);

    if (error) {
        console.error("Check Failed:", error.message);
        if (error.code === '42703') {
            console.log("DIAGNOSIS: The column 'mini_entreprise_annee' DOES NOT EXIST.");
            console.log("ACTION: You must run the 'migration_mini_entreprise.sql' script successfully.");
        } else {
            console.log("DIAGNOSIS: Unexpected error (" + error.code + "). Check permissions or connection.");
        }
    } else {
        console.log("Check Successful: The column exists.");
        console.log("DIAGNOSIS: The column might be there, but maybe there's a cached schema issue in the dashboard?");
    }
}

verifyColumns();
