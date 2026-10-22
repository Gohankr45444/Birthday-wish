export interface MemoryItem {
  id: string;
  title: string;
  caption: string;
  secretBackNote: string;
  dateTag: string;
  imageUrl: string;
  sticker: string;
}

export interface BirthdayContent {
  name: string;
  nickname: string;
  age: number;
  dob: string;
  fromName: string;
  relationship: 'friend' | 'girlfriend' | 'sister' | 'bestie';
  tone: 'cute-funny' | 'romantic' | 'emotional' | 'mix';
  candleCount: number;
  musicUrl: string;
  gate: {
    badge: string;
    title: string;
    subtitle: string;
    cta: string;
  };
  intro: {
    constellationPrompt: string;
    line1: string;
    line2: string;
    cta: string;
  };
  countdown: {
    preTitle: string;
    headlinePrefix: string;
    subline: string;
    cta: string;
  };
  memoriesHeader: {
    title: string;
    subtitle: string;
    cta: string;
  };
  memories: MemoryItem[];
  cakeScene: {
    lightTitle: string;
    lightPrompt: string;
    lightButtonCta: string;
    title: string;
    prompt: string;
    listeningHint: string;
    calibratingHint: string;
    micFallbackMessage: string;
    holdToBlowCta: string;
    cutTitle: string;
    cutPrompt: string;
    cutButtonCta: string;
    celebrationHeadline: string;
    celebrationSub: string;
    nextCta: string;
  };
  letter: {
    envelopePrompt: string;
    salutation: string;
    paragraphs: string[];
    voucherPrize: string;
    voucherSub: string;
    closing: string;
    signature: string;
    nextCta: string;
  };
  finale: {
    badge: string;
    headline: string;
    subtext: string;
    balloonHint: string;
    compliments: string[];
    replayCta: string;
  };
}

export const CONTENT: BirthdayContent = {
  name: 'Prachii',
  nickname: 'Panda',
  age: 24,
  dob: '21-10',
  fromName: 'Rakchas',
  relationship: 'friend',
  tone: 'mix',
  candleCount: 5,
  musicUrl: '${import.meta.env.BASE_URL}assets/music/bg.mp3',

  gate: {
    badge: '24 • 10 • Interactive Edition ✨',
    title: 'Hey Prachii, rukh zara...',
    subtitle: 'Headphones laga le! Isme sirf dekhna nahi hai—har screen pe kuch touch ya play karna hai.',
    cta: 'Tap karke shuru kar ✨',
  },

  intro: {
    constellationPrompt: 'Raat ke aasmaan mein in 5 sitaron ko tap karke jod ✨',
    line1: 'Ek chhoti si surprise hai sirf tere liye...',
    line2:
      'Aaj ka din bilkul special hai, kyunki aaj tu paida hui thi (aur duniya thodi aur sundar—aur thodi zyada dramatic—ho gayi 😄).',
    cta: 'Aage dekh →',
  },

  countdown: {
    preTitle: 'Tayyar hai?',
    headlinePrefix: 'Happy Birthday,',
    subline:
      'Level 24 unlocked! Abhi bhi dimaag se 5 saal ki hi ho, par chalo koi baat nahi—we still love you 💖',
    cta: 'Chalo thoda flashback mein ✨',
  },

  memoriesHeader: {
    title: 'Hamari Pagalpanti 📸',
    subtitle: 'Double-tap photo for ❤️ • Tap "Flip ↻" for secret roast',
    cta: 'Ab sabse main cheez! 🎂',
  },

  memories: [
    {
      id: 'mem-1',
      title: '2 AM Maggi & Zero Logic Talks',
      caption:
        'Desi chai adda pe Maggi khana aur paranthe khana ka maza hi alag hai. Aur teri bakbak ke bina toh din adhoori lagti hai 🤭',
      secretBackNote:
        'Sach bataun toh uss din Maggi thodi kacchi thi, par teri gossip itni spicy thi ki pata hi nahi chala 🤫🍜',
      dateTag: 'Late Night Chronicles',
      imageUrl:
        '${import.meta.env.BASE_URL}assets/photos/p1.JPG',
      sticker: '🍜✨',
    },
    {
      id: 'mem-2',
      title: 'Kulhad wali Chai = Tera Oxygen',
      caption:
        'Chahe bahar kitni bhi garmi ho, Madam ko kulhad chai hi chahiye. Aur phir bolti hai "yaar kitni garmi hai" 🧋',
      secretBackNote:
        'Tere khoon mein B+ nahi, chai daudta hai. Doctor ko bhi dikhaogi toh chai patti hi milegi ☕😂',
      dateTag: 'Chai Addict',
      imageUrl:
        '${import.meta.env.BASE_URL}assets/photos/p2.JPG',
      sticker: '📸💖',
    },
    {
      id: 'mem-3',
      title: 'Google Maps Ki Dushman',
      caption:
        '"Mujhe rasta yaad hai!" — Famous last words before hum 3 kilometer galat nikal gaye. Best detour ever though 🛵',
      secretBackNote:
        'Agli baar jab tu bole "left le lo", main bina soche right mud jaunga. 100% success rate guaranteed 🧭😜',
      dateTag: 'Lost Navigator',
      imageUrl:
        '${import.meta.env.BASE_URL}assets/photos/p3.JPG',
      sticker: '🗺️😂',
    },
    {
      id: 'mem-4',
      title: 'Mera Safe Space',
      caption:
        'Jokes apart, jab bhi life thodi heavy lagti hai, tere saath 5 minute baith ke sab theek lagne lagta hai. Thank you for existing 🫶',
      secretBackNote:
        'Koi roast nahi yahan—bas itna kehna tha ki tu genuinely one in a million hai. Never change 🤍✨',
      dateTag: 'Forever Grateful',
      imageUrl:
        'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
      sticker: '🌙🤍',
    },
  ],

  cakeScene: {
    lightTitle: 'Step 1: Candles Jalao ✨',
    lightPrompt: 'Cake ke upar candles ko tap kar (ya niche Sparkler button daba) unhe jalane ke liye!',
    lightButtonCta: 'Sparkler se Candles Jala 🪄',
    title: 'Step 2: Make a Wish & Blow 🎂',
    prompt: 'Aankhein band kar, dil se wish maang... aur phone ke mic mein phoonk maar!',
    listeningHint: 'Mic sun raha hai... zor se phoonk maar! 🌬️',
    calibratingHint: 'Ek second, kamre ki aawaz check ho rahi hai...',
    micFallbackMessage:
      'Mic allow nahi hua, koi baat nahi! Niche button daba ke rakh ya cake ko tap karke phoonk maar 🎂',
    holdToBlowCta: 'Hold / Tap to Blow Candles 🌬️',
    cutTitle: 'Step 3: Ab Cake Kaat! 🔪',
    cutPrompt: 'Cake ke upar ungli swipe kar (ya niche button daba) pehla piece kaatne ke liye!',
    cutButtonCta: 'Slice the Birthday Cake 🍰',
    celebrationHeadline: 'Yayyy! Happy 24nd, Panda! 🎉',
    celebrationSub: 'Teri saari wishes poori hon (even wo wali jo tu kisi ko nahi batati ✨)',
    nextCta: 'Ek Secret Envelope tere liye 💌',
  },

  letter: {
    envelopePrompt: 'Gold Wax Seal ko tap karke lifafa kholo ✨',
    salutation: 'Dearest Pandaaa,',
    paragraphs: [
      'Sabse pehle toh—Happiest 24nd Birthday! Mujhe pata hai tu birthday pe thoda overthink karti hai, par aaj sirf khush rehne ka din hai.',
      'Pichle kuch saalon mein tune itni saari memories bana li hain ki kabhi-kabhi yakeen nahi hota. Tera har chhoti baat pe excited hona, bina bole samajh jaana jab mera mood off ho, aur wo non-stop bakbak—kabhi mat badalna.',
      'Life mein aage bohot saare naye chapters aayenge, par ek cheez pakki hai: chahe raat ke 2 baje rona ho ya kisi random achievement pe party karni ho, main hamesha ek call door milunga.',
      'Khush reh, chamakti reh, aur hamesha aisi hi thodi si pagal aur bohot saari pyari rehna.',
    ],
    voucherPrize: '1x Unlimited kulhad chai & Long Drive Treat 🧋🛵',
    voucherSub: 'Screenshot leke rakh le — Valid 24x7, No Questions Asked ✨',
    closing: 'Hamesha tera cheerleader,',
    signature: 'Rakchas ✨',
    nextCta: 'One last thing... 🎈',
  },

  finale: {
    badge: 'Happy 24nd Birthday 💖',
    headline: 'Keep Shining, Panda!',
    subtext:
      'Ab jaa aur apna asli cake kaat (aur mere liye bada wala piece bacha ke rakhna!). Have the most magical year ahead.',
    balloonHint: '🎈 Udte hue 3D balloons ko tap karke phodo for secret compliments!',
    compliments: [
      'Certified Drama Queen 👑',
      '10/10 Bestie Material 💖',
      'Cutest Smile in the Room 🌸',
      'Kulhad Chai Brand Ambassador 🧋',
      'Purest Heart Ever 🫶',
      'Vibe Check: 100% Immaculate ✨',
    ],
    replayCta: 'Phir se khelo (Replay) ↻',
  },
};
