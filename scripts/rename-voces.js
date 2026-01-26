/**
 * Renombra los MP3 en src/assets/voces para usar códigos de idioma: es, en, it, de, fr.
 * Ejecutar: node scripts/rename-voces.js
 */

const fs = require('fs');
const path = require('path');

const VOCES_DIR = path.join(__dirname, '..', 'src', 'assets', 'voces');
const RENAMES = {
  carlos_aleman: 'carlos_de',
  carlos_español: 'carlos_es',
  carlos_frances: 'carlos_fr',
  carlos_ingles: 'carlos_en',
  carlos_italiano: 'carlos_it',
  claudia_aleman: 'claudia_de',
  claudia_español: 'claudia_es',
  claudia_frances: 'claudia_fr',
  claudia_ingles: 'claudia_en',
  claudia_italiano: 'claudia_it',
  david_aleman: 'david_de',
  david_español: 'david_es',
  david_frances: 'david_fr',
  david_ingles: 'david_en',
  david_italiano: 'david_it',
  jesus_aleman: 'jesus_de',
  jesus_español: 'jesus_es',
  jesus_frances: 'jesus_fr',
  jesus_ingles: 'jesus_en',
  jesus_italiano: 'jesus_it',
  maria_aleman: 'maria_de',
  maria_español: 'maria_es',
  maria_frances: 'maria_fr',
  maria_ingles: 'maria_en',
  maria_italiano: 'maria_it',
};

let renamed = 0;
for (const [oldName, newName] of Object.entries(RENAMES)) {
  const oldPath = path.join(VOCES_DIR, `${oldName}.mp3`);
  const newPath = path.join(VOCES_DIR, `${newName}.mp3`);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renombrado: ${oldName}.mp3 -> ${newName}.mp3`);
    renamed++;
  }
}
console.log(`Listo. ${renamed} archivos renombrados.`);
