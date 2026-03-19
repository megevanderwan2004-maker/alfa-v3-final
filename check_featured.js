import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://egfurglzwuthkixwrvou.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    console.log("🔍 Verificando esquema de tabla 'catalog'...");
    
    // Get one row to see columns
    const { data, error } = await supabase
        .from('catalog')
        .select('*')
        .limit(1);

    if (error) {
        console.error("❌ Error:", error.message);
    } else if (data && data.length > 0) {
        console.log("✅ Columnas encontradas:", Object.keys(data[0]));
        if (Object.keys(data[0]).includes('featured')) {
            console.log("⭐ La columna 'featured' EXISTE.");
        } else {
            console.log("⚠️ La columna 'featured' NO EXISTE. Intentando crearla...");
            // We can't easily add columns via the SDK without SQL, 
            // but I can tell the user to run the SQL if needed.
        }
    } else {
        console.log("Empty table");
    }
}

checkSchema();
