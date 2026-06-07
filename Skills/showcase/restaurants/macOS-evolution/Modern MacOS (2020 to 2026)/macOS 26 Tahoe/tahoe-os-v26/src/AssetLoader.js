export const AssetLoader = {
  // Map of local fallback paths to GDrive IDs to resolve 404s dynamically
  Icons: {
    'books.png': '1TTy5ONLLCFL-czyD_lJZP6RYAaRykU09',
    'wallet.png': '1Nb8NSqOuaJ0OTzb_GKqvYItoW2v3YNMf',
    'github.png': '1_cSQYyH1FzEgGg-OnOs9uUaMNg18Q1RH',
    'trash_empty.png': '1ZWwnDphCZ9pFv8WiA7HYfGSygMckWRen',
    'trash_full.png': '1JXxjJSrBDAZVrvdTsYXzdY9MbK0dO1E_',
    'macintosh_hd.ico': '112F_-S7ptcDeXaYB7krS8AzaojhfcmsX',
  },
  Sounds: {
    'glass.aiff': '13HDFfiroOeFm_CPTu54VgsPZzb60j7Ks',
  },
  Wallpapers: {
    'tahoe-light.png': '1ecc3P0UAtfqAAwrxvQcWjBULfB_tJbLF', // Replace with exact file ID
    'tahoe-dark.png': '1ecc3P0UAtfqAAwrxvQcWjBULfB_tJbLF',
  }
};

export const resolveAsset = (type, name) => {
  return AssetLoader[type] && AssetLoader[type][name] ? `https://drive.google.com/uc?id=${AssetLoader[type][name]}` : `/assets/${name}`;
};
