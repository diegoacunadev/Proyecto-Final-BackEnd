/**
 * 🌎 Filtrar ubicaciones (Colombia, Argentina, México)
 * Fuente: https://github.com/dr5hn/countries-states-cities-database
 */

import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

// URL oficial del JSON completo
const SOURCE_URL =
  'https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/refs/heads/master/json/countries%2Bstates%2Bcities.json';

// Países que quieres conservar
const COUNTRIES = ['Colombia', 'Argentina', 'Mexico'];

async function filterLocations() {
  console.log('🌍 Descargando base de datos completa...');

  // 👇 Evita error "data es de tipo unknown"
  const { data }: { data: any } = await axios.get(SOURCE_URL);

  console.log(`✅ Archivo original cargado (${data.length} países)`);

  console.log(`🔍 Filtrando países: ${COUNTRIES.join(', ')}`);
  const filtered = data.filter((country: any) =>
    COUNTRIES.includes(country.name),
  );

  const result = filtered.map((country: any) => ({
    name: country.name,
    code: country.iso2,
    regions: country.states.map((state: any) => ({
      name: state.name,
      code: state.state_code,
      cities: state.cities.map((city: any) => city.name),
    })),
  }));

  // Guardar archivo filtrado
  const outputDir = path.join(__dirname, 'data');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, 'locations.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');

  console.log(`✅ Archivo filtrado generado: ${outputPath}`);
}

filterLocations().catch((err) => {
  console.error('❌ Error al generar el archivo filtrado:', err.message);
});
