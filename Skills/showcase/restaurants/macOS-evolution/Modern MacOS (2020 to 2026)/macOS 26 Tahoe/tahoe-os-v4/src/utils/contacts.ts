export interface Contact {
  id: number;
  name: string;
  title: string;
  department: string;
  phone: string;
  email: string;
  work: string;
  faceTime: string;
}

export const contacts: Contact[] = [
  {
    id: 1,
    name: 'Executive Chairman',
    title: 'Executive Chairman',
    department: 'Board of Directors',
    phone: '+91 98XXX XXXXX',
    email: 'chairman@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'chairman@icloud.com'
  },
  // --- C-Suite & SVPs (Teachers) ---
  {
    id: 2,
    name: 'Ms. Sonia Bajpai',
    title: 'Chief Executive Officer',
    department: 'Executive',
    phone: '+91 98XXX XXXXX',
    email: 'sonia.bajpai@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'sonia.bajpai@icloud.com'
  },
  {
    id: 3,
    name: 'Ms. Devyani Trivedi',
    title: 'Chief Operating Officer',
    department: 'Operations',
    phone: '+91 98XXX XXXXX',
    email: 'devyani.trivedi@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'devyani.trivedi@icloud.com'
  },
  {
    id: 4,
    name: 'Mr. Green Kamal Pandey',
    title: 'Chief Financial Officer',
    department: 'Finance',
    phone: '+91 98XXX XXXXX',
    email: 'green.pandey@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'green.pandey@icloud.com'
  },
  {
    id: 5,
    name: 'Ms. Nishi Garg',
    title: 'SVP, Software Engineering',
    department: 'Software Engineering',
    phone: '+91 98XXX XXXXX',
    email: 'nishi.garg@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'nishi.garg@icloud.com'
  },
  {
    id: 6,
    name: 'Ms. Shalu Bhatia',
    title: 'Chief Hardware Officer',
    department: 'Hardware Engineering',
    phone: '+91 98XXX XXXXX',
    email: 'shalu.bhatia@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'shalu.bhatia@icloud.com'
  },
  {
    id: 7,
    name: 'Mr. Aaditya Kumar',
    title: 'SVP, Hardware Technologies (Silicon)',
    department: 'Silicon Engineering',
    phone: '+91 98XXX XXXXX',
    email: 'aaditya.kumar@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'aaditya.kumar@icloud.com'
  },
  {
    id: 8,
    name: 'Ms. Iti Bhattarchrjee',
    title: 'SVP, Worldwide Marketing',
    department: 'Marketing',
    phone: '+91 98XXX XXXXX',
    email: 'iti.bhattarchrjee@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'iti.bhattarchrjee@icloud.com'
  },
  {
    id: 9,
    name: 'Ms. Abhishiri Agrawal',
    title: 'SVP, Services (iCloud/Music)',
    department: 'Services',
    phone: '+91 98XXX XXXXX',
    email: 'abhishiri.agrawal@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'abhishiri.agrawal@icloud.com'
  },
  {
    id: 10,
    name: 'Ms. Ekta Bhudwani',
    title: 'SVP, Retail + People',
    department: 'Retail & People',
    phone: '+91 98XXX XXXXX',
    email: 'ekta.bhudwani@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'ekta.bhudwani@icloud.com'
  },
  {
    id: 11,
    name: 'Ms. Neeta Garg',
    title: 'General Counsel',
    department: 'Legal',
    phone: '+91 98XXX XXXXX',
    email: 'neeta.garg@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'neeta.garg@icloud.com'
  },
  // --- Department Leads & VPs (Students) ---
  {
    id: 32,
    name: 'Kritharth Tiwari',
    title: 'VP, Core Software Architecture',
    department: 'Software Engineering',
    phone: '+91 98XXX XXXXX',
    email: 'kritharth.tiwari@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'kritharth.tiwari@icloud.com'
  },
  {
    id: 12,
    name: 'Reyansh Rampuria',
    title: 'VP, iOS Engineering',
    department: 'Software Engineering',
    phone: '+91 98XXX XXXXX',
    email: 'reyansh.rampuria@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'reyansh.rampuria@icloud.com'
  },
  {
    id: 13,
    name: 'Afifa Shoaib Khan',
    title: 'VP, macOS Tahoe Development',
    department: 'Software Engineering',
    phone: '+91 98XXX XXXXX',
    email: 'afifa.khan@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'afifa.khan@icloud.com'
  },
  {
    id: 14,
    name: 'Vanya Chaudhary',
    title: 'Head of Tahoe UI/UX',
    department: 'Software Engineering',
    phone: '+91 98XXX XXXXX',
    email: 'vanya.chaudhary@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'vanya.chaudhary@icloud.com'
  },
  {
    id: 15,
    name: 'Reyansh Gupta',
    title: 'VP, Product Design',
    department: 'Hardware Engineering',
    phone: '+91 98XXX XXXXX',
    email: 'reyansh.gupta@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'reyansh.gupta@icloud.com'
  },
  {
    id: 16,
    name: 'Shivoy Malodia',
    title: 'Lead iPhone Architecture',
    department: 'Hardware Engineering',
    phone: '+91 98XXX XXXXX',
    email: 'shivoy.malodia@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'shivoy.malodia@icloud.com'
  },
  {
    id: 17,
    name: 'Ginni Gupta',
    title: 'VP, Silicon Design',
    department: 'Silicon Engineering',
    phone: '+91 98XXX XXXXX',
    email: 'ginni.gupta@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'ginni.gupta@icloud.com'
  },
  {
    id: 18,
    name: 'Yusuf Swami',
    title: 'Lead M5 Chip Design',
    department: 'Silicon Engineering',
    phone: '+91 98XXX XXXXX',
    email: 'yusuf.swami@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'yusuf.swami@icloud.com'
  },
  {
    id: 19,
    name: 'Aaradhay Shukla',
    title: 'VP, iCloud Infrastructure',
    department: 'Services',
    phone: '+91 98XXX XXXXX',
    email: 'aaradhay.shukla@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'aaradhay.shukla@icloud.com'
  },
  {
    id: 20,
    name: 'Samriddhi Verma',
    title: 'VP, Apple Music & Media',
    department: 'Services',
    phone: '+91 98XXX XXXXX',
    email: 'samriddhi.verma@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'samriddhi.verma@icloud.com'
  },
  {
    id: 21,
    name: 'Shreya Verma',
    title: 'VP, Worldwide Product Marketing',
    department: 'Marketing',
    phone: '+91 98XXX XXXXX',
    email: 'shreya.verma@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'shreya.verma@icloud.com'
  },
  {
    id: 22,
    name: 'Diya Tandon',
    title: 'Lead Communications',
    department: 'Marketing',
    phone: '+91 98XXX XXXXX',
    email: 'diya.tandon@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'diya.tandon@icloud.com'
  },
  {
    id: 23,
    name: 'Mishthi Sharma',
    title: 'VP, Global Supply Chain',
    department: 'Operations',
    phone: '+91 98XXX XXXXX',
    email: 'mishthi.sharma@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'mishthi.sharma@icloud.com'
  },
  {
    id: 24,
    name: 'Rudra Kumar',
    title: 'Lead Manufacturing Operations',
    department: 'Operations',
    phone: '+91 98XXX XXXXX',
    email: 'rudra.kumar@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'rudra.kumar@icloud.com'
  },
  {
    id: 25,
    name: 'Poorvika Gupta',
    title: 'VP, Corporate Finance',
    department: 'Finance',
    phone: '+91 98XXX XXXXX',
    email: 'poorvika.gupta@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'poorvika.gupta@icloud.com'
  },
  {
    id: 26,
    name: 'Abdul Kabeer',
    title: 'VP, Apple Retail',
    department: 'Retail & People',
    phone: '+91 98XXX XXXXX',
    email: 'abdul.kabeer@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'abdul.kabeer@icloud.com'
  },
  {
    id: 27,
    name: 'Abdul Abaan',
    title: 'Head of People Operations',
    department: 'Retail & People',
    phone: '+91 98XXX XXXXX',
    email: 'abdul.abaan@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'abdul.abaan@icloud.com'
  },
  {
    id: 28,
    name: 'Aarav Gupta',
    title: 'VP, Intellectual Property',
    department: 'Legal',
    phone: '+91 98XXX XXXXX',
    email: 'aarav.gupta@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'aarav.gupta@icloud.com'
  },
  {
    id: 29,
    name: 'Arnab Singh',
    title: 'Chief of Staff',
    department: 'Executive',
    phone: '+91 98XXX XXXXX',
    email: 'arnab.singh@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'arnab.singh@icloud.com'
  },
  {
    id: 30,
    name: 'Hassan Noor',
    title: 'Lead Security Engineering',
    department: 'Software Engineering',
    phone: '+91 98XXX XXXXX',
    email: 'hassan.noor@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'hassan.noor@icloud.com'
  },
  {
    id: 31,
    name: 'Swarn Gupta',
    title: 'Head of Sustainability',
    department: 'Operations',
    phone: '+91 98XXX XXXXX',
    email: 'swarn.gupta@icloud.com',
    work: 'Apple Park, Cupertino / Tahoe Digital HQ',
    faceTime: 'swarn.gupta@icloud.com'
  }
];
