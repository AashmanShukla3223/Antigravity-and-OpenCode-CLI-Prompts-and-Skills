import React, { useState } from 'react';
import { 
  GlobalIcon, 
  Mail01Icon, 
  Message01Icon, 
  Settings01Icon, 
  Delete02Icon,
  MusicNote01Icon,
  ComputerTerminal01Icon,
  UserIcon,
  SmartPhone01Icon
  } from 'hugeicons-react';

interface AppIconProps {
  id: string;
  className?: string;
  size?: number;
  isFull?: boolean;
  folderColor?: string;
}

export const AppIcon: React.FC<AppIconProps> = ({ id, className = "", size = 32, isFull = false, folderColor = "blue" }) => {
  const [imageLoadError, setImageLoadError] = useState<Record<string, boolean>>({});
  const iconProps = { size: size * 0.6, className: "z-10 text-white drop-shadow-lg hugeicon-tahoe" };

  const base = (import.meta as any).env?.BASE_URL || '/';

  const getFolderPath = (iconId: string, color: string) => {
    const mappings: Record<string, string> = {
      'folder': 'folder.png',
      'folder-user-home': 'user-home.png',
      'folder-desktop': 'user-desktop.png',
      'folder-documents': 'folder-documents.png',
      'folder-downloads': 'folder-download.png',
      'folder-pictures': 'folder-images.png',
      'folder-movies': 'folder-videos.png',
      'folder-music': 'folder-music.png',
      'folder-root': 'folder-root.png',
      'folder-system': 'folder-root.png',
      'folder-library': 'folder-temp.png',
      'folder-public': 'folder-public.png',
      'folder-templates': 'folder-templates.png',
      'apps': 'folder-templates.png'
    };
    
    const fileName = mappings[iconId] || 'folder.png';
    return `${base}folder icons/${color}/${fileName}`;
  };

  const localIcons: Record<string, string> = {
    'safari': `${base}icons/safari.png`,
    'settings': `${base}icons/settings.png`,
    'music': `${base}icons/music.png`,
    'messages': `${base}icons/messages.png`,
    'facetime': `${base}icons/facetime.png`,
    'finder': `${base}icons/finder.png`,
    'systemsettings': `${base}icons/settings.png`,
    'itunes': `${base}icons/itunes.png`,
    'appstore': `${base}icons/appstore.png`,
    'mail': `${base}icons/mail.png`,
    'maps': `${base}icons/maps.png`,
    'photos': `${base}icons/photos.png`,
    'files': `${base}icons/files.png`,
    'downloads': `${base}folder icons/blue/folder-download.png`,
    'soundtest': `${base}icons/garageband.png`,
    'trash': isFull ? `${base}icons/trash_full.png` : `${base}icons/trash_empty.png`,
    'calendar': `${base}icons/calendar.png`,
    'clock': `${base}icons/clock.png`,
    'contacts': `${base}icons/contacts.png`,
    'reminders': `${base}icons/reminders.png`,
    'stickies': `${base}icons/stickies.png`,
    'notes': `${base}icons/notes.png`,
    'terminal': `${base}icons/terminal.png`,
    'activitymonitor': `${base}icons/activity.png`,
    'calculator': `${base}icons/calculator.png`,
    'phone': `${base}icons/phone.png`,
    'keynote': `${base}icons/keynote.png`,
    'pages': `${base}icons/pages.png`,
    'numbers': `${base}icons/numbers.png`,
    'tv': `${base}icons/tv.png`,
    'applearcade': `${base}icons/arcade.png`,
    'iphonemirroring': `${base}icons/iPhone Mirroring.png`,
    'console': `${base}icons/console.png`,
    'controlcenter': `${base}icons/controlcenter.png`,
    'keychainaccess': `${base}icons/keychain.png`,
    'apps': `${base}icons/apps.png`,
    'weather': `${base}icons/weather.png`,
    'camera': `${base}icons/camera.png`,
    'books': `${base}icons/books.png`,
    'wallet': `${base}icons/wallet.png`,
    'github': `${base}icons/github.png`,
    // New folder icons
    'folder': `${base}folder icons/blue/folder.png`,
    'folder-user-home': `${base}folder icons/blue/user-home.png`,
    'folder-desktop': `${base}folder icons/blue/user-desktop.png`,
    'folder-documents': `${base}folder icons/blue/folder-documents.png`,
    'folder-downloads': `${base}folder icons/blue/folder-download.png`,
    'folder-pictures': `${base}folder icons/blue/folder-images.png`,
    'folder-movies': `${base}folder icons/blue/folder-videos.png`,
    'folder-music': `${base}folder icons/blue/folder-music.png`,
    'folder-root': `${base}folder icons/blue/folder-root.png`,
    'folder-system': `${base}folder icons/blue/folder-root.png`,
    'folder-library': `${base}folder icons/blue/folder-temp.png`,
    'folder-public': `${base}folder icons/blue/folder-public.png`,
  };

  const handleImageError = (iconId: string) => {
    setImageLoadError(prev => ({ ...prev, [iconId]: true }));
  };

  const renderIcon = () => {
    const idLower = id.toLowerCase();
    let localIcon = localIcons[idLower];
    const hasError = imageLoadError[idLower];

    // Special handling for folders
    if (idLower.startsWith('folder-') || idLower === 'folder' || idLower === 'apps') {
      localIcon = getFolderPath(idLower, folderColor);
    }
    
    if (localIcon && !hasError) {
      return (
        <div className="w-full h-full rounded-[22%] overflow-hidden flex items-center justify-center">
          <img 
            src={localIcon} 
            alt={id} 
            className="w-full h-full object-contain" 
            onError={() => handleImageError(idLower)}
          />
        </div>
      );
    }

    switch (idLower) {
      case 'weather':
        return (
          <div className="w-full h-full rounded-[22%] overflow-hidden bg-gradient-to-b from-blue-400 to-blue-600 shadow-lg border border-white/20">
            <img 
              src={localIcons['weather']} 
              alt="Weather" 
              className="w-full h-full object-cover scale-110" 
              onError={() => handleImageError('weather')}
            />
          </div>
        );
      case 'stickies':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-gradient-to-br from-yellow-300 to-yellow-500 border border-white/30 shadow-lg overflow-hidden">
            <div className="space-y-1 px-2">
              <div className="w-6 h-0.5 bg-black/20 rounded" />
              <div className="w-5 h-0.5 bg-black/20 rounded" />
              <div className="w-4 h-0.5 bg-black/20 rounded" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
          </div>
        );
      case 'finder':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] shadow-inner overflow-hidden border border-white/20">
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
               <div className="flex gap-2.5">
                 <div className="w-2 h-4 bg-white/90 rounded-full" />
                 <div className="w-2 h-4 bg-white/90 rounded-full" />
               </div>
               <div className="w-10 h-3 border-b-4 border-white/90 rounded-[50%] mt-1" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
          </div>
        );
      case 'safari':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-white/10 backdrop-blur-md border border-white/30 shadow-lg overflow-hidden">
            <div className="absolute w-[90%] h-[90%] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-inner" />
            <GlobalIcon {...iconProps} />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
          </div>
        );
      case 'mail':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-gradient-to-br from-sky-400 to-blue-500 border border-white/30 shadow-lg overflow-hidden">
             <div className="absolute top-0 w-full h-1/2 bg-white/10" />
             <Mail01Icon {...iconProps} />
          </div>
        );
      case 'messages':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-gradient-to-br from-green-400 to-green-600 border border-white/30 shadow-lg overflow-hidden">
             <Message01Icon {...iconProps} />
             <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
          </div>
        );
      case 'photos':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-white border border-white/20 shadow-lg overflow-hidden p-1.5">
             <div className="grid grid-cols-2 grid-rows-2 gap-0.5 w-full h-full rounded-sm overflow-hidden">
                <div className="bg-pink-400 rounded-tl-sm" />
                <div className="bg-blue-400 rounded-tr-sm" />
                <div className="bg-yellow-400 rounded-bl-sm" />
                <div className="bg-green-400 rounded-br-sm" />
             </div>
             <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
          </div>
        );
      case 'settings':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-gradient-to-br from-gray-400 to-gray-600 border border-white/30 shadow-lg overflow-hidden">
             <Settings01Icon {...iconProps} />
             <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
          </div>
        );
      case 'trash':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-white/5 backdrop-blur-md border border-white/10 shadow-lg overflow-hidden">
             <Delete02Icon {...iconProps} className={`${isFull ? 'text-white' : 'text-white/40'} hugeicon-tahoe`} />
          </div>
        );
      case 'music':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-gradient-to-br from-pink-500 to-red-500 border border-white/30 shadow-lg overflow-hidden">
             <MusicNote01Icon {...iconProps} />
          </div>
        );
      case 'terminal':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-zinc-800 border border-white/20 shadow-lg overflow-hidden">
             <ComputerTerminal01Icon {...iconProps} className="text-green-400 hugeicon-tahoe" />
          </div>
        );
      case 'iphonemirroring':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-zinc-900 border border-white/20 shadow-lg overflow-hidden">
             <SmartPhone01Icon {...iconProps} className="text-white hugeicon-tahoe" />
             <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
          </div>
        );
      case 'contacts':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-white border border-white/30 shadow-lg overflow-hidden">
             <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gray-100 rounded-b-[22%]" />
             <UserIcon {...iconProps} className="text-gray-600 hugeicon-tahoe" />
             <div className="absolute top-2 right-2 flex gap-0.5">
                <div className="w-1 h-4 bg-red-400 rounded-full shadow-sm" />
                <div className="w-1 h-4 bg-blue-400 rounded-full shadow-sm" />
             </div>
          </div>
        );
      default:
        return <div className="bg-white/10 backdrop-blur-md w-full h-full rounded-[22%] flex items-center justify-center text-white text-xs">{id}</div>;
    }
  };

  return (
    <div className={`w-full h-full relative group transition-transform ${className}`}>
      {renderIcon()}
      <div className="absolute inset-0 rounded-[22%] bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none" />
    </div>
  );
};
