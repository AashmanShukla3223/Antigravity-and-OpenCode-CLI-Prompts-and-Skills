export class FileSystemResolver {
  static getMimeIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (!ext || ext === filename) return 'assets/mimes/unknown.png';
    
    // Dynamic mapping engine for mimes
    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'ico'];
    const textExts = ['txt', 'css', 'html', 'js', 'json', 'md', 'ts', 'xml', 'csv', 'yaml', 'toml'];
    const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'];
    const videoExts = ['mp4', 'mkv', 'avi', 'mov', 'webm'];
    
    if (ext === 'pdf') return 'assets/mimes/application-pdf.png';
    if (ext === 'zip' || ext === 'tar' || ext === 'gz' || ext === 'rar' || ext === '7z') return 'assets/mimes/application-x-zip.png';
    if (ext === 'exe' || ext === 'msi') return 'assets/mimes/application-x-ms-dos-executable.png';
    if (ext === 'dmg' || ext === 'pkg') return 'assets/mimes/application-x-apple-diskimage.png';
    
    if (imageExts.includes(ext)) return `assets/mimes/image-${ext}.png`;
    if (textExts.includes(ext)) return `assets/mimes/text-${ext}.png`;
    if (audioExts.includes(ext)) return `assets/mimes/audio-x-generic.png`;
    if (videoExts.includes(ext)) return `assets/mimes/video-x-generic.png`;
    
    return `assets/mimes/application-${ext}.png`;
  }

  static getEmblemOverlay(folderType: string): string | null {
    // Dynamic mapping for emblems
    const special = ['documents', 'downloads', 'desktop', 'pictures', 'movies', 'music', 'public', 'system', 'library'];
    const normalized = folderType.toLowerCase().replace('folder-', '');
    if (special.includes(normalized)) {
      if (normalized === 'desktop') return 'assets/emblems/emblem-desktop.png';
      if (normalized === 'pictures') return 'assets/emblems/emblem-photos.png';
      if (normalized === 'movies') return 'assets/emblems/emblem-videos.png';
      return `assets/emblems/emblem-${normalized}.png`;
    }
    return null;
  }

  static getStatusIcon(statusName: string): string {
    return `assets/status/${statusName}.png`;
  }

  static getPreferenceIcon(prefName: string): string {
    return `assets/preferences/${prefName}.png`;
  }

  static getDeviceIcon(deviceName: string): string {
    return `assets/devices/${deviceName}.png`;
  }

  static getCategoryIcon(categoryName: string): string {
    return `assets/categories/${categoryName}.png`;
  }
}
