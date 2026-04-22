import React from 'react';
import { 
  GlobalIcon, 
  Mail01Icon, 
  Message01Icon, 
  Settings01Icon, 
  Delete02Icon,
  MusicNote01Icon,
  PlayIcon,
  ComputerTerminal01Icon,
  Activity01Icon,
  Call02Icon,
  Location01Icon,
  Store01Icon,
  BookOpen01Icon,
  Wallet01Icon,
  GithubIcon,
  Calendar01Icon,
  Note01Icon,
  DashboardSquare01Icon,
  Video01Icon,
  UserIcon
} from 'hugeicons-react';

interface AppIconProps {
  id: string;
  className?: string;
  size?: number;
  isFull?: boolean;
}

export const AppIcon: React.FC<AppIconProps> = ({ id, className = "", size = 32, isFull = false }) => {
  const iconProps = { size: size * 0.6, className: "z-10 text-white drop-shadow-lg hugeicon-tahoe" };

  const localIcons: Record<string, string> = {
    'safari': '/icons/safari.png',
    'settings': '/icons/settings.png',
    'music': '/icons/music.png',
    'messages': '/icons/messages.png',
    'facetime': '/icons/facetime.png',
    'finder': '/icons/finder.png',
    'systemsettings': '/icons/settings.png',
    'itunes': '/icons/itunes.png',
    'appstore': '/icons/appstore.png',
    'mail': '/icons/mail.png',
    'maps': '/icons/maps.png',
    'photos': '/icons/photos.png',
    'files': '/icons/files.png',
    'soundtest': '/icons/garageband.png',
    'trash': isFull ? '/icons/trash_full.png' : '/icons/trash_empty.png',
    'calendar': '/icons/calendar.png',
    'clock': '/icons/clock.png',
    'contacts': '/icons/contacts.png',
    'reminders': '/icons/reminders.png',
    'stickies': '/icons/stickies.png',
    'notes': '/icons/notes.png',
    'terminal': '/icons/terminal.png',
    'activitymonitor': '/icons/activity.png',
    'calculator': '/icons/calculator.png',
    'phone': '/icons/phone.png',
    'keynote': '/icons/keynote.png',
    'pages': '/icons/pages.png',
    'numbers': '/icons/numbers.png',
    'tv': '/icons/tv.png',
    'applearcade': '/icons/arcade.png',
    'iphonemirroring': '/icons/mirroring.png',
    'console': '/icons/console.png',
    'controlcenter': '/icons/controlcenter.png',
    'keychainaccess': '/icons/keychain.png',
    'apps': '/icons/apps.png',
    'weather': '/icons/weather.png',
    'camera': '/icons/camera.png',
    'books': '/icons/books.png',
    'wallet': '/icons/wallet.png',
    'github': '/icons/github.png'
  };

  const renderIcon = () => {
    const idLower = id.toLowerCase();
    const localIcon = localIcons[idLower];
    
    if (localIcon) {
      if (idLower === 'calendar') {
        const date = new Date();
        return (
          <div className="relative flex flex-col items-center w-full h-full rounded-[22%] bg-white border border-white/30 shadow-lg overflow-hidden">
             <div className="w-full bg-[#FF3B30] h-[30%] flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-tighter">
               {date.toLocaleDateString('en-US', { month: 'short' })}
             </div>
             <div className="flex-1 flex items-center justify-center text-xl font-light text-black pt-0.5">
               {date.getDate()}
             </div>
          </div>
        );
      }

      return (
        <div className="w-full h-full">
          <img src={localIcon} alt={id} className="w-full h-full object-contain" />
        </div>
      );
    }

    switch (idLower) {
      case 'finder':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] shadow-inner overflow-hidden border border-white/20">
            {/* The smiling face from Tahoe PRD */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
               <div className="flex gap-2.5">
                 <div className="w-2 h-4 bg-white/90 rounded-full" />
                 <div className="w-2 h-4 bg-white/90 rounded-full" />
               </div>
               <div className="w-10 h-3 border-b-4 border-white/90 rounded-[50%] mt-1" />
            </div>
            {/* Glass refraction layer */}
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
             {isFull && (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  <div className="w-1/2 h-1/2 bg-white rounded-full blur-xl" />
               </div>
             )}
          </div>
        );
      case 'calendar':
         const date = new Date();
         return (
           <div className="relative flex flex-col items-center w-full h-full rounded-[22%] bg-white border border-white/30 shadow-lg overflow-hidden">
              <div className="w-full bg-[#FF3B30] h-[30%] flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-tighter">
                {date.toLocaleDateString('en-US', { month: 'short' })}
              </div>
              <div className="flex-1 flex items-center justify-center text-xl font-light text-black pt-0.5">
                {date.getDate()}
              </div>
           </div>
         );
      case 'music':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-gradient-to-br from-pink-500 to-red-500 border border-white/30 shadow-lg overflow-hidden">
             <MusicNote01Icon {...iconProps} />
          </div>
        );
      case 'tv':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-zinc-900 border border-white/10 shadow-lg overflow-hidden">
             <PlayIcon {...iconProps} />
          </div>
        );
      case 'terminal':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-zinc-800 border border-white/20 shadow-lg overflow-hidden">
             <ComputerTerminal01Icon {...iconProps} className="text-green-400 hugeicon-tahoe" />
          </div>
        );
      case 'activitymonitor':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-zinc-900 border border-white/10 shadow-lg overflow-hidden">
             <Activity01Icon {...iconProps} className="text-cyan-400 hugeicon-tahoe" />
          </div>
        );
      case 'phone':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-gradient-to-br from-green-400 to-green-500 border border-white/30 shadow-lg overflow-hidden">
             <Call02Icon {...iconProps} className="text-white hugeicon-tahoe" />
             <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
          </div>
        );
      case 'maps':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-gradient-to-br from-blue-300 to-green-200 border border-white/30 shadow-lg overflow-hidden">
             <Location01Icon {...iconProps} className="text-blue-600 hugeicon-tahoe" />
             <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
          </div>
        );
      case 'appstore':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-gradient-to-br from-[#5AC8FA] to-[#007AFF] border border-white/30 shadow-lg overflow-hidden">
             <Store01Icon {...iconProps} />
             <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
          </div>
        );
      case 'books':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-gradient-to-br from-orange-400 to-orange-600 border border-white/30 shadow-lg overflow-hidden">
             <BookOpen01Icon {...iconProps} />
             <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
          </div>
        );
      case 'wallet':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-zinc-900 border border-white/10 shadow-lg overflow-hidden">
             <Wallet01Icon {...iconProps} className="text-blue-500 hugeicon-tahoe" />
             <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
          </div>
        );
      case 'github':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-zinc-800 border border-white/10 shadow-lg overflow-hidden">
             <GithubIcon {...iconProps} className="text-white hugeicon-tahoe" />
             <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
          </div>
        );
      case 'reminders':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-white border border-white/30 shadow-lg overflow-hidden">
             <Calendar01Icon {...iconProps} className="text-blue-500 hugeicon-tahoe" />
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent pointer-events-none" />
          </div>
        );
      case 'stickies':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-gradient-to-br from-yellow-200 to-yellow-400 border border-black/5 shadow-lg overflow-hidden">
             <Note01Icon {...iconProps} className="text-yellow-900 hugeicon-tahoe" />
          </div>
        );
      case 'apps':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-gradient-to-br from-blue-400 to-blue-600 border border-white/30 shadow-lg overflow-hidden">
             <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <DashboardSquare01Icon size={size * 0.8} />
             </div>
             <DashboardSquare01Icon {...iconProps} />
             <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
          </div>
        );
      case 'facetime':
        return (
          <div className="relative flex items-center justify-center w-full h-full rounded-[22%] bg-gradient-to-br from-green-400 to-green-600 border border-white/30 shadow-lg overflow-hidden">
             <Video01Icon {...iconProps} />
             <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
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
      {/* Silicon Surge Glow Effect */}
      <div className="absolute inset-0 rounded-[22%] bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none" />
    </div>
  );
};
