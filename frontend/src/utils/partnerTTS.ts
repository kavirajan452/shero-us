import type { SubscriptionMealOrder } from "@/data/partnerSubscriptionData";
import type { ServiceBooking } from "@/data/partnerSubscriptionData";

// Map language codes to BCP 47 speech synthesis locale tags
export const langToVoiceLocale: Record<string, string> = {
  en: "en-IN", "en-IN": "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN",
  kn: "kn-IN", ml: "ml-IN", bn: "bn-IN", mr: "mr-IN",
  gu: "gu-IN", es: "es-ES", fr: "fr-FR", ar: "ar-SA", zh: "zh-CN",
};

type TemplateFn = (details: string) => string;

const templates: Record<string, TemplateFn> = {
  en: (d) => d,
  hi: (d) => d,
  ta: (d) => d,
  te: (d) => d,
  kn: (d) => d,
  ml: (d) => d,
  bn: (d) => d,
  mr: (d) => d,
  gu: (d) => d,
  es: (d) => d,
  fr: (d) => d,
  ar: (d) => d,
  zh: (d) => d,
};

// ── Subscription order speech ──
const subLabels: Record<string, { order: string; slot: string; plan: string; portions: string; items: string; customer: string; allergen: string; note: string }> = {
  en: { order: "Subscription order", slot: "Slot", plan: "Plan", portions: "portions", items: "Items", customer: "Customer", allergen: "Allergy warning", note: "Note" },
  hi: { order: "सब्सक्रिप्शन ऑर्डर", slot: "स्लॉट", plan: "प्लान", portions: "पोर्शन", items: "आइटम", customer: "ग्राहक", allergen: "एलर्जी चेतावनी", note: "नोट" },
  ta: { order: "சந்தா ஆர்டர்", slot: "நேரம்", plan: "திட்டம்", portions: "பகுதிகள்", items: "பொருட்கள்", customer: "வாடிக்கையாளர்", allergen: "ஒவ்வாமை எச்சரிக்கை", note: "குறிப்பு" },
  te: { order: "సబ్‌స్క్రిప్షన్ ఆర్డర్", slot: "స్లాట్", plan: "ప్లాన్", portions: "పోర్షన్లు", items: "అంశాలు", customer: "కస్టమర్", allergen: "అలర్జీ హెచ్చరిక", note: "గమనిక" },
  kn: { order: "ಚಂದಾ ಆರ್ಡರ್", slot: "ಸ್ಲಾಟ್", plan: "ಯೋಜನೆ", portions: "ಭಾಗಗಳು", items: "ವಸ್ತುಗಳು", customer: "ಗ್ರಾಹಕ", allergen: "ಅಲರ್ಜಿ ಎಚ್ಚರಿಕೆ", note: "ಟಿಪ್ಪಣಿ" },
  ml: { order: "സബ്‌സ്ക്രിപ്ഷൻ ഓർഡർ", slot: "സ്ലോട്ട്", plan: "പ്ലാൻ", portions: "ഭാഗങ്ങൾ", items: "ഇനങ്ങൾ", customer: "ഉപഭോക്താവ്", allergen: "അലർജി മുന്നറിയിപ്പ്", note: "കുറിപ്പ്" },
  bn: { order: "সাবস্ক্রিপশন অর্ডার", slot: "স্লট", plan: "প্ল্যান", portions: "পোর্শন", items: "আইটেম", customer: "গ্রাহক", allergen: "অ্যালার্জি সতর্কতা", note: "নোট" },
  mr: { order: "सबस्क्रिप्शन ऑर्डर", slot: "स्लॉट", plan: "प्लॅन", portions: "पोर्शन", items: "आयटम", customer: "ग्राहक", allergen: "ॲलर्जी इशारा", note: "टीप" },
  gu: { order: "સબ્સ્ક્રિપ્શન ઓર્ડર", slot: "સ્લોટ", plan: "પ્લાન", portions: "ભાગ", items: "આઇટમ્સ", customer: "ગ્રાહક", allergen: "એલર્જી ચેતવણી", note: "નોંધ" },
  es: { order: "Pedido de suscripción", slot: "Turno", plan: "Plan", portions: "porciones", items: "Artículos", customer: "Cliente", allergen: "Alerta de alergia", note: "Nota" },
  fr: { order: "Commande d'abonnement", slot: "Créneau", plan: "Plan", portions: "portions", items: "Articles", customer: "Client", allergen: "Alerte allergie", note: "Note" },
  ar: { order: "طلب اشتراك", slot: "الفترة", plan: "الخطة", portions: "حصص", items: "العناصر", customer: "العميل", allergen: "تحذير حساسية", note: "ملاحظة" },
  zh: { order: "订阅订单", slot: "时段", plan: "计划", portions: "份", items: "项目", customer: "客户", allergen: "过敏警告", note: "备注" },
};

const slotLabels: Record<string, Record<string, string>> = {
  en: { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" },
  hi: { breakfast: "नाश्ता", lunch: "दोपहर का खाना", dinner: "रात का खाना" },
  ta: { breakfast: "காலை உணவு", lunch: "மதிய உணவு", dinner: "இரவு உணவு" },
  te: { breakfast: "అల్పాహారం", lunch: "మధ్యాహ్న భోజనం", dinner: "రాత్రి భోజనం" },
  kn: { breakfast: "ಬೆಳಗಿನ ಉಪಾಹಾರ", lunch: "ಮಧ್ಯಾಹ್ನದ ಊಟ", dinner: "ರಾತ್ರಿ ಊಟ" },
  ml: { breakfast: "പ്രാതൽ", lunch: "ഉച്ചഭക്ഷണം", dinner: "അത്താഴം" },
  bn: { breakfast: "সকালের খাবার", lunch: "দুপুরের খাবার", dinner: "রাতের খাবার" },
  mr: { breakfast: "न्याहारी", lunch: "दुपारचे जेवण", dinner: "रात्रीचे जेवण" },
  gu: { breakfast: "નાસ્તો", lunch: "બપોરનું ભોજન", dinner: "રાત્રિભોજન" },
  es: { breakfast: "Desayuno", lunch: "Almuerzo", dinner: "Cena" },
  fr: { breakfast: "Petit-déjeuner", lunch: "Déjeuner", dinner: "Dîner" },
  ar: { breakfast: "فطور", lunch: "غداء", dinner: "عشاء" },
  zh: { breakfast: "早餐", lunch: "午餐", dinner: "晚餐" },
};

export const buildSubscriptionSpeech = (order: SubscriptionMealOrder, lang: string): string => {
  const base = lang.split("-")[0];
  const l = subLabels[lang] || subLabels[base] || subLabels.en;
  const slots = slotLabels[lang] || slotLabels[base] || slotLabels.en;
  const itemList = order.items.map((i) => `${i.name}, ${i.qty}`).join(". ");
  const customerSummary = order.customers.map((c) => {
    let s = c.name;
    if (c.allergens?.length) s += `. ${l.allergen}: ${c.allergens.join(", ")}`;
    if (c.note) s += `. ${l.note}: ${c.note}`;
    return s;
  }).join(". ");

  return `${l.order} ${order.id}. ${l.slot}: ${slots[order.slot] || order.slot}. ${l.plan}: ${order.planType}. ${order.totalPortions} ${l.portions}. ${l.items}: ${itemList}. ${l.customer}: ${customerSummary}.`;
};

// ── Service booking speech ──
const svcLabels: Record<string, { booking: string; service: string; customer: string; date: string; time: string; duration: string; mode: string; participants: string; note: string; address: string }> = {
  en: { booking: "Service booking", service: "Service", customer: "Customer", date: "Date", time: "Time", duration: "Duration", mode: "Mode", participants: "participants", note: "Note", address: "Location" },
  hi: { booking: "सेवा बुकिंग", service: "सेवा", customer: "ग्राहक", date: "तारीख", time: "समय", duration: "अवधि", mode: "मोड", participants: "प्रतिभागी", note: "नोट", address: "स्थान" },
  ta: { booking: "சேவை முன்பதிவு", service: "சேவை", customer: "வாடிக்கையாளர்", date: "தேதி", time: "நேரம்", duration: "கால", mode: "முறை", participants: "பங்கேற்பாளர்கள்", note: "குறிப்பு", address: "இடம்" },
  te: { booking: "సేవ బుకింగ్", service: "సేవ", customer: "కస్టమర్", date: "తేదీ", time: "సమయం", duration: "వ్యవధి", mode: "మోడ్", participants: "పాల్గొనేవారు", note: "గమనిక", address: "ప్రదేశం" },
  kn: { booking: "ಸೇವಾ ಬುಕಿಂಗ್", service: "ಸೇವೆ", customer: "ಗ್ರಾಹಕ", date: "ದಿನಾಂಕ", time: "ಸಮಯ", duration: "ಅವಧಿ", mode: "ಮೋಡ್", participants: "ಭಾಗವಹಿಸುವವರು", note: "ಟಿಪ್ಪಣಿ", address: "ಸ್ಥಳ" },
  ml: { booking: "സേവന ബുക്കിംഗ്", service: "സേവനം", customer: "ഉപഭോക്താവ്", date: "തീയതി", time: "സമയം", duration: "കാലാവധി", mode: "മോഡ്", participants: "പങ്കാളികൾ", note: "കുറിപ്പ്", address: "സ്ഥലം" },
  bn: { booking: "সেবা বুকিং", service: "সেবা", customer: "গ্রাহক", date: "তারিখ", time: "সময়", duration: "সময়কাল", mode: "মোড", participants: "অংশগ্রহণকারী", note: "নোট", address: "অবস্থান" },
  mr: { booking: "सेवा बुकिंग", service: "सेवा", customer: "ग्राहक", date: "तारीख", time: "वेळ", duration: "कालावधी", mode: "मोड", participants: "सहभागी", note: "टीप", address: "ठिकाण" },
  gu: { booking: "સેવા બુકિંગ", service: "સેવા", customer: "ગ્રાહક", date: "તારીખ", time: "સમય", duration: "સમયગાળો", mode: "મોડ", participants: "સહભાગીઓ", note: "નોંધ", address: "સ્થળ" },
  es: { booking: "Reserva de servicio", service: "Servicio", customer: "Cliente", date: "Fecha", time: "Hora", duration: "Duración", mode: "Modo", participants: "participantes", note: "Nota", address: "Ubicación" },
  fr: { booking: "Réservation de service", service: "Service", customer: "Client", date: "Date", time: "Heure", duration: "Durée", mode: "Mode", participants: "participants", note: "Note", address: "Lieu" },
  ar: { booking: "حجز خدمة", service: "الخدمة", customer: "العميل", date: "التاريخ", time: "الوقت", duration: "المدة", mode: "الوضع", participants: "المشاركين", note: "ملاحظة", address: "الموقع" },
  zh: { booking: "服务预约", service: "服务", customer: "客户", date: "日期", time: "时间", duration: "时长", mode: "方式", participants: "参与者", note: "备注", address: "地点" },
};

export const buildServiceSpeech = (booking: ServiceBooking, lang: string): string => {
  const base = lang.split("-")[0];
  const l = svcLabels[lang] || svcLabels[base] || svcLabels.en;
  let speech = `${l.booking} ${booking.id}. ${l.service}: ${booking.serviceName}. ${l.customer}: ${booking.customerName}. ${l.date}: ${booking.date}. ${l.time}: ${booking.time}. ${l.duration}: ${booking.duration}. ${l.mode}: ${booking.mode === "online" ? "Online" : "In-Person"}.`;
  if (booking.studentsCount && booking.studentsCount > 1) speech += ` ${booking.studentsCount} ${l.participants}.`;
  if (booking.address) speech += ` ${l.address}: ${booking.address}.`;
  if (booking.notes) speech += ` ${l.note}: ${booking.notes}.`;
  return speech;
};

export const speak = (text: string, lang: string, onStart?: () => void, onEnd?: () => void) => {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langToVoiceLocale[lang] || "en-IN";
  utterance.rate = 0.9;
  if (onStart) onStart();
  utterance.onend = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
};
