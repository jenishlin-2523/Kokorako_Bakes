import { supabase } from './src/services/supabase.ts';

async function checkTables() {
    const tables = ['settings', 'config', 'store_config'];
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (!error) {
            console.log(`Table ${table} exists!`);
        } else {
            console.log(`Table ${table} does not exist or error: ${error.message}`);
        }
    }
}

checkTables();
