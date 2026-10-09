import { useSyncExternalStore } from "react";

export type Lang = "en" | "hi" | "mr";

export const LANGS: { code: Lang; native: string; english: string }[] = [
  { code: "en", native: "English", english: "English" },
  { code: "hi", native: "हिन्दी", english: "Hindi" },
  { code: "mr", native: "मराठी", english: "Marathi" },
];

// English phrase -> [Hindi, Marathi]. Missing phrases fall back to English.
const D: Record<string, [string, string]> = {
  // navigation and common
  "Sharma Motors": ["शर्मा मोटर्स", "शर्मा मोटर्स"],
  "Jobs": ["जॉब्स", "कामे"],
  "Stock": ["स्टॉक", "साठा"],
  "My Garage": ["मेरा गैराज", "माझे गॅरेज"],
  "Notifications": ["सूचनाएँ", "सूचना"],
  "Primary navigation": ["मुख्य नेविगेशन", "मुख्य नेव्हिगेशन"],
  "Back": ["वापस", "मागे"],
  "Back to jobs": ["जॉब्स पर वापस", "कामांकडे परत"],
  "Back to My Garage": ["मेरे गैराज पर वापस", "माझ्या गॅरेजकडे परत"],
  "Language": ["भाषा", "भाषा"],
  "Choose the app language": ["ऐप की भाषा चुनें", "अ‍ॅपची भाषा निवडा"],
  "Add": ["जोड़ें", "जोडा"],
  "Confirm": ["पुष्टि करें", "निश्चित करा"],
  "Confirm · {amount}": ["पुष्टि करें · {amount}", "निश्चित करा · {amount}"],
  "Next": ["आगे", "पुढे"],
  "Total": ["कुल", "एकूण"],
  "Today": ["आज", "आज"],
  "Tomorrow": ["कल", "उद्या"],
  "Delivered": ["डिलीवर किया गया", "वितरित"],
  "Cash": ["नकद", "रोख"],

  // stock
  "Total parts": ["कुल पार्ट्स", "एकूण भाग"],
  "Running low": ["कम हो रहे", "कमी होत आहेत"],
  "To order": ["ऑर्डर करना है", "ऑर्डर करायचे"],
  "Stock value": ["स्टॉक मूल्य", "साठ्याची किंमत"],
  "Search parts": ["पार्ट्स खोजें", "भाग शोधा"],
  "Search pistons, brake pads, Bosch…": ["पिस्टन, ब्रेक पैड, बॉश खोजें…", "पिस्टन, ब्रेक पॅड, बॉश शोधा…"],
  "Stock overview": ["स्टॉक अवलोकन", "साठ्याचा आढावा"],
  "Add part": ["पार्ट जोड़ें", "भाग जोडा"],
  "Nothing here.": ["यहाँ कुछ नहीं।", "येथे काहीही नाही."],
  "Nothing here for “{q}”.": ["“{q}” के लिए यहाँ कुछ नहीं।", "“{q}” साठी येथे काहीही नाही."],
  "{n} brand": ["{n} ब्रांड", "{n} ब्रँड"],
  "{n} brands": ["{n} ब्रांड", "{n} ब्रँड"],
  "low, reorder at {n}": ["कम, {n} पर ऑर्डर करें", "कमी, {n} वर ऑर्डर करा"],
  "{price} each": ["{price} प्रति नग", "प्रत्येकी {price}"],
  "TO ORDER": ["ऑर्डर करें", "ऑर्डर करा"],
  "ORDERED": ["ऑर्डर हो गया", "ऑर्डर केले"],
  "Receive stock": ["स्टॉक प्राप्त करें", "साठा स्वीकारा"],
  "Remove from list": ["सूची से हटाएँ", "यादीतून काढा"],
  "Mark to order": ["ऑर्डर के लिए चिह्नित करें", "ऑर्डरसाठी चिन्हांकित करा"],
  "Add new part": ["नया पार्ट जोड़ें", "नवीन भाग जोडा"],
  "PART NAME": ["पार्ट का नाम", "भागाचे नाव"],
  "Part name": ["पार्ट का नाम", "भागाचे नाव"],
  "BRAND": ["ब्रांड", "ब्रँड"],
  "Brand": ["ब्रांड", "ब्रँड"],
  "PRICE EACH (₹)": ["प्रति नग कीमत (₹)", "प्रति नग किंमत (₹)"],
  "Price each": ["प्रति नग कीमत", "प्रति नग किंमत"],
  "REORDER LEVEL (default 5)": ["रीऑर्डर स्तर (डिफ़ॉल्ट 5)", "रीऑर्डर पातळी (डिफॉल्ट 5)"],
  "Reorder level": ["रीऑर्डर स्तर", "रीऑर्डर पातळी"],
  "Quantity": ["मात्रा", "प्रमाण"],
  "Add to stock": ["स्टॉक में जोड़ें", "साठ्यात जोडा"],
  "Decrease {label}": ["{label} घटाएँ", "{label} कमी करा"],
  "Increase {label}": ["{label} बढ़ाएँ", "{label} वाढवा"],
  "{name} · {n} in stock now": ["{name} · अभी {n} स्टॉक में", "{name} · सध्या {n} साठ्यात"],
  "OR TYPE A NEW BRAND": ["या नया ब्रांड लिखें", "किंवा नवीन ब्रँड लिहा"],
  "New brand": ["नया ब्रांड", "नवीन ब्रँड"],
  "Units received": ["प्राप्त इकाइयाँ", "मिळालेले नग"],
  "New total": ["नया कुल", "नवीन एकूण"],
  "Stock value added": ["जोड़ा गया स्टॉक मूल्य", "वाढलेली साठ्याची किंमत"],
  "Add {n} to stock": ["स्टॉक में {n} जोड़ें", "साठ्यात {n} जोडा"],
  "Out of stock": ["स्टॉक खत्म", "साठा संपला"],
  "{n} left": ["{n} बचे", "{n} शिल्लक"],
  "{n} in stock": ["{n} स्टॉक में", "{n} साठ्यात"],
  "Part": ["पार्ट", "भाग"],

  // part names
  "Pistons": ["पिस्टन", "पिस्टन"],
  "Piston": ["पिस्टन", "पिस्टन"],
  "Brake pads": ["ब्रेक पैड", "ब्रेक पॅड"],
  "Brake pad": ["ब्रेक पैड", "ब्रेक पॅड"],
  "Oil filters": ["ऑयल फ़िल्टर", "ऑइल फिल्टर"],
  "Oil filter": ["ऑयल फ़िल्टर", "ऑइल फिल्टर"],
  "Spark plugs": ["स्पार्क प्लग", "स्पार्क प्लग"],
  "Spark plug": ["स्पार्क प्लग", "स्पार्क प्लग"],
  "Batteries": ["बैटरियाँ", "बॅटऱ्या"],
  "Battery": ["बैटरी", "बॅटरी"],
  "Timing belts": ["टाइमिंग बेल्ट", "टायमिंग बेल्ट"],
  "Timing belt": ["टाइमिंग बेल्ट", "टायमिंग बेल्ट"],
  "Engine oil (5L)": ["इंजन ऑयल (5L)", "इंजिन ऑइल (5L)"],
  "Engine oil 5L": ["इंजन ऑयल 5L", "इंजिन ऑइल 5L"],
  "Headlight bulbs": ["हेडलाइट बल्ब", "हेडलाइट बल्ब"],
  "Headlight bulb": ["हेडलाइट बल्ब", "हेडलाइट बल्ब"],
  "Clutch plates": ["क्लच प्लेट", "क्लच प्लेट"],
  "Clutch plate": ["क्लच प्लेट", "क्लच प्लेट"],

  // jobs
  "Scan plate": ["प्लेट स्कैन करें", "प्लेट स्कॅन करा"],
  "New job": ["नया जॉब", "नवीन काम"],
  "All jobs": ["सभी जॉब", "सर्व कामे"],
  "All jobs are done. Scan a plate to start a new one.": ["सभी जॉब पूरे हो गए। नया शुरू करने के लिए प्लेट स्कैन करें।", "सर्व कामे पूर्ण झाली. नवीन सुरू करण्यासाठी प्लेट स्कॅन करा."],
  "Estimate": ["अनुमान", "अंदाज"],
  "Ready by": ["तैयार होने का समय", "तयार होण्याची वेळ"],
  "Ready {when}": ["{when} तक तैयार", "{when} पर्यंत तयार"],
  "Billed": ["बिल बन गया", "बिल झाले"],
  "In work": ["काम जारी", "काम सुरू"],
  "Queued": ["कतार में", "रांगेत"],
  "Inspection": ["निरीक्षण", "तपासणी"],
  "Done": ["पूर्ण", "पूर्ण"],
  "Received": ["प्राप्त", "स्वीकारले"],
  "In repair": ["मरम्मत में", "दुरुस्तीत"],
  "Ready": ["तैयार", "तयार"],
  "IN WORK": ["काम जारी", "काम सुरू"],
  "QUEUED": ["कतार में", "रांगेत"],
  "INSPECTION": ["निरीक्षण", "तपासणी"],
  "READY": ["तैयार", "तयार"],
  "DONE": ["पूर्ण", "पूर्ण"],
  "RECEIVED": ["प्राप्त", "स्वीकारले"],
  "IN REPAIR": ["मरम्मत में", "दुरुस्तीत"],
  "Add part or service": ["पार्ट या सेवा जोड़ें", "भाग किंवा सेवा जोडा"],
  "Start repair": ["मरम्मत शुरू करें", "दुरुस्ती सुरू करा"],
  "Ready for pickup": ["पिकअप के लिए तैयार", "पिकअपसाठी तयार"],
  "Inform the customer": ["ग्राहक को सूचित करें", "ग्राहकाला कळवा"],
  "Call": ["कॉल", "कॉल"],
  "Notify": ["सूचित करें", "कळवा"],
  "Notified": ["सूचित किया", "कळवले"],
  "Payment received via": ["भुगतान प्राप्ति का तरीका", "पेमेंट कोणत्या मार्गाने मिळाले"],
  "Waiting for customer approval": ["ग्राहक की मंज़ूरी का इंतज़ार", "ग्राहकाच्या मंजुरीची प्रतीक्षा"],
  "Mark as done · {amount}": ["पूर्ण चिह्नित करें · {amount}", "पूर्ण म्हणून चिन्हांकित करा · {amount}"],
  "Scan number plate": ["नंबर प्लेट स्कैन करें", "नंबर प्लेट स्कॅन करा"],
  "READING…": ["पढ़ रहा है…", "वाचत आहे…"],
  "Scanning…": ["स्कैन हो रहा है…", "स्कॅन होत आहे…"],
  "Align the plate inside the frame": ["प्लेट को फ्रेम के अंदर रखें", "प्लेट फ्रेमच्या आत ठेवा"],
  "VEHICLE NUMBER": ["वाहन नंबर", "वाहन क्रमांक"],
  "VEHICLE MODEL": ["वाहन मॉडल", "वाहन मॉडेल"],
  "NAME": ["नाम", "नाव"],
  "NUMBER": ["फ़ोन नंबर", "फोन नंबर"],
  "edit": ["बदलें", "बदला"],
  "Create work": ["काम बनाएँ", "काम तयार करा"],
  "Repair Progress": ["मरम्मत की प्रगति", "दुरुस्तीची प्रगती"],
  "Repair progress": ["मरम्मत की प्रगति", "दुरुस्तीची प्रगती"],
  "Awaiting customer": ["ग्राहक की प्रतीक्षा", "ग्राहकाची प्रतीक्षा"],
  "Services": ["सेवाएँ", "सेवा"],
  "No services yet": ["अभी कोई सेवा नहीं", "अद्याप सेवा नाहीत"],
  "Parts": ["पार्ट्स", "भाग"],
  "No parts yet": ["अभी कोई पार्ट नहीं", "अद्याप भाग नाहीत"],
  "Labour charges": ["मज़दूरी शुल्क", "मजुरी शुल्क"],
  "Service charges": ["सेवा शुल्क", "सेवा शुल्क"],
  "Full service + oil change": ["पूरी सर्विस + ऑयल बदलाव", "संपूर्ण सर्व्हिस + ऑइल बदल"],
  "Brake inspection": ["ब्रेक जाँच", "ब्रेक तपासणी"],
  "AC gas top-up": ["AC गैस टॉप-अप", "AC गॅस टॉप-अप"],
  "Wheel alignment": ["व्हील अलाइनमेंट", "व्हील अलाइनमेंट"],

  // add flow
  "Categories": ["श्रेणियाँ", "श्रेणी"],
  "What is {plate} · {vehicle} here for?": ["{plate} · {vehicle} किस काम के लिए आई है?", "{plate} · {vehicle} कशासाठी आली आहे?"],
  "For {plate} · {vehicle}": ["{plate} · {vehicle} के लिए", "{plate} · {vehicle} साठी"],
  "{sub} · tap to leave an item out": ["{sub} · किसी आइटम को छोड़ने के लिए टैप करें", "{sub} · एखादा आयटम वगळण्यासाठी टॅप करा"],
  "{sub} · tick the parts you used": ["{sub} · इस्तेमाल किए पार्ट्स चुनें", "{sub} · वापरलेले भाग निवडा"],
  "{n} items + service charges": ["{n} आइटम + सेवा शुल्क", "{n} आयटम + सेवा शुल्क"],
  "Single part from stock": ["स्टॉक से एक पार्ट", "साठ्यातील एक भाग"],
  "Pick one or more parts": ["एक या अधिक पार्ट चुनें", "एक किंवा अधिक भाग निवडा"],
  "Goes to {name} on WhatsApp. The items stay greyed out on the bill until they approve.": ["{name} को WhatsApp पर जाएगा। मंज़ूरी तक आइटम बिल में धुँधले रहेंगे।", "{name} यांना WhatsApp वर जाईल. मंजुरी मिळेपर्यंत आयटम बिलावर फिकट राहतील."],
  "Bike regular service": ["बाइक नियमित सर्विस", "बाईक नियमित सर्व्हिस"],
  "Bike regular service with wash": ["बाइक नियमित सर्विस वॉश के साथ", "बाईक नियमित सर्व्हिस वॉशसह"],
  "Brake correction": ["ब्रेक सुधार", "ब्रेक दुरुस्ती"],
  "Mirror attachment": ["मिरर लगाना", "मिरर बसवणे"],
  "Engine problem": ["इंजन की समस्या", "इंजिनची समस्या"],
  "Oil change": ["ऑयल बदलना", "ऑइल बदल"],
  "Engine oil": ["इंजन ऑयल", "इंजिन ऑइल"],
  "Filter cleaning": ["फ़िल्टर सफाई", "फिल्टर साफसफाई"],
  "Chain lubrication": ["चेन लुब्रिकेशन", "चेन वंगण"],
  "Wash": ["वॉश", "वॉश"],
  "Brake pad adjustment": ["ब्रेक पैड एडजस्टमेंट", "ब्रेक पॅड अ‍ॅडजस्टमेंट"],
  "Brake fluid top-up": ["ब्रेक फ्लूइड टॉप-अप", "ब्रेक फ्लुइड टॉप-अप"],
  "Lining check": ["लाइनिंग जाँच", "लायनिंग तपासणी"],
  "Mirror": ["मिरर", "मिरर"],
  "Mounting bolts": ["माउंटिंग बोल्ट", "माउंटिंग बोल्ट"],
  "Compression test": ["कम्प्रेशन टेस्ट", "कॉम्प्रेशन टेस्ट"],
  "Carburettor cleaning": ["कार्बोरेटर सफाई", "कार्बोरेटर साफसफाई"],
  "Valve clearance": ["वाल्व क्लीयरेंस", "व्हॉल्व्ह क्लिअरन्स"],
  "Gasket set": ["गास्केट सेट", "गॅस्केट सेट"],

  // receipt and notifications
  "Payment received": ["भुगतान प्राप्त", "पेमेंट मिळाले"],
  "Bill logged to My Garage": ["बिल मेरे गैराज में दर्ज", "बिल माझ्या गॅरेजमध्ये नोंदवले"],
  "Bill": ["बिल", "बिल"],
  "Total paid": ["कुल भुगतान", "एकूण दिलेले"],
  "Paid via {method}": ["{method} से भुगतान", "{method} द्वारे पेमेंट"],
  "{day} Oct 2026": ["{day} अक्टूबर 2026", "{day} ऑक्टोबर 2026"],
  "{plate} awaiting approval": ["{plate} मंज़ूरी का इंतज़ार", "{plate} मंजुरीच्या प्रतीक्षेत"],
  "{name} has items to approve": ["{name} को आइटम मंज़ूर करने हैं", "{name} यांनी आयटम मंजूर करायचे आहेत"],
  "{plate} is ready": ["{plate} तैयार है", "{plate} तयार आहे"],
  "Tell the customer and take payment": ["ग्राहक को बताएँ और भुगतान लें", "ग्राहकाला कळवा आणि पेमेंट घ्या"],
  "{name} running low": ["{name} कम हो रहे हैं", "{name} कमी होत आहे"],
  "{n} left, reorder at {r}": ["{n} बचे, {r} पर ऑर्डर करें", "{n} शिल्लक, {r} वर ऑर्डर करा"],
  "{amount} received": ["{amount} प्राप्त", "{amount} मिळाले"],
  "You are all caught up": ["सब कुछ अपडेट है", "सर्व काही अद्ययावत आहे"],
  "Nothing needs your attention right now.": ["अभी किसी चीज़ पर ध्यान देने की ज़रूरत नहीं।", "सध्या कशाकडेही लक्ष देण्याची गरज नाही."],

  // garage
  "Show whole range": ["पूरी अवधि दिखाएँ", "संपूर्ण कालावधी दाखवा"],
  "Previous week": ["पिछला सप्ताह", "मागील आठवडा"],
  "Next week": ["अगला सप्ताह", "पुढील आठवडा"],
  "Collapse to week": ["सप्ताह दृश्य", "आठवडा दृश्य"],
  "Expand to full month": ["पूरा महीना दिखाएँ", "संपूर्ण महिना दाखवा"],
  "{d} October": ["{d} अक्टूबर", "{d} ऑक्टोबर"],
  "{d} Oct": ["{d} अक्टू", "{d} ऑक्टो"],
  "{a}–{b} Oct": ["{a}–{b} अक्टू", "{a}–{b} ऑक्टो"],
  "October 2026": ["अक्टूबर 2026", "ऑक्टोबर 2026"],
  "week": ["सप्ताह", "आठवडा"],
  "day": ["दिन", "दिवस"],
  "month": ["महीना", "महिना"],
  "Profit · {label}": ["लाभ · {label}", "नफा · {label}"],
  "In": ["आय", "जमा"],
  "Wages": ["वेतन", "पगार"],
  "Bills & services": ["बिल और सेवाएँ", "बिले आणि सेवा"],
  "No bills logged for {label}.": ["{label} के लिए कोई बिल दर्ज नहीं।", "{label} साठी कोणतेही बिल नोंदवलेले नाही."],
  "{day} Oct · {method}": ["{day} अक्टू · {method}", "{day} ऑक्टो · {method}"],
  "Clutch plate, labour": ["क्लच प्लेट, मज़दूरी", "क्लच प्लेट, मजुरी"],
  "labour": ["मज़दूरी", "मजुरी"],
  "Full service": ["पूरी सर्विस", "संपूर्ण सर्व्हिस"],
  "battery": ["बैटरी", "बॅटरी"],
  "Restock": ["रीस्टॉक", "पुन्हा साठा"],
  "Due {days} Oct": ["{days} अक्टू को देय", "{days} ऑक्टो रोजी देय"],
  "No restock day": ["कोई रीस्टॉक दिन नहीं", "पुन्हा साठ्याचा दिवस नाही"],
  "Nothing marked. Low: {list}.": ["कुछ चिह्नित नहीं। कम: {list}।", "काहीही चिन्हांकित नाही. कमी: {list}."],
  "{name} · {n} left": ["{name} · {n} बचे", "{name} · {n} शिल्लक"],
  "Mark ordered": ["ऑर्डर किया चिह्नित करें", "ऑर्डर केले म्हणून चिन्हांकित करा"],
  "· awaiting delivery": ["· डिलीवरी का इंतज़ार", "· डिलिव्हरीची प्रतीक्षा"],
  "Team": ["टीम", "टीम"],
  "Senior mechanic": ["वरिष्ठ मैकेनिक", "वरिष्ठ मेकॅनिक"],
  "Electrical & AC": ["इलेक्ट्रिकल और AC", "इलेक्ट्रिकल आणि AC"],
  "Helper": ["सहायक", "मदतनीस"],
  "Mechanic": ["मैकेनिक", "मेकॅनिक"],
  "On job": ["काम पर", "कामावर"],
  "Free": ["खाली", "मोकळा"],
  "No job": ["कोई जॉब नहीं", "काम नाही"],
  "Mechanic name": ["मैकेनिक का नाम", "मेकॅनिकचे नाव"],
  "Add mechanic": ["मैकेनिक जोड़ें", "मेकॅनिक जोडा"],
  "Sun": ["रवि", "रवि"],
  "Mon": ["सोम", "सोम"],
  "Tue": ["मंगल", "मंगळ"],
  "Wed": ["बुध", "बुध"],
  "Thu": ["गुरु", "गुरू"],
  "Fri": ["शुक्र", "शुक्र"],
  "Sat": ["शनि", "शनि"],

  // toasts
  "{name} removed from order list": ["{name} ऑर्डर सूची से हटाया", "{name} ऑर्डर यादीतून काढले"],
  "{name} added to My Garage orders": ["{name} मेरे गैराज के ऑर्डर में जोड़ा गया", "{name} माझ्या गॅरेजच्या ऑर्डरमध्ये जोडले"],
  "Customer approved {item}": ["ग्राहक ने {item} मंज़ूर किया", "ग्राहकाने {item} मंजूर केले"],
  "Sent to customer on WhatsApp for approval": ["मंज़ूरी के लिए ग्राहक को WhatsApp पर भेजा", "मंजुरीसाठी ग्राहकाला WhatsApp वर पाठवले"],
  "Work created for {plate}": ["{plate} के लिए काम बनाया गया", "{plate} साठी काम तयार केले"],
  "Marked ready for pickup": ["पिकअप के लिए तैयार चिह्नित", "पिकअपसाठी तयार म्हणून चिन्हांकित"],
  "Moved to {stage}": ["{stage} में ले जाया गया", "{stage} मध्ये हलवले"],
  "Bill {amount} logged to My Garage": ["{amount} का बिल मेरे गैराज में दर्ज", "{amount} चे बिल माझ्या गॅरेजमध्ये नोंदवले"],
  "{name} added to stock": ["{name} स्टॉक में जोड़ा गया", "{name} साठ्यात जोडले"],
  "{qty} {name} added to stock": ["{qty} {name} स्टॉक में जोड़े गए", "{qty} {name} साठ्यात जोडले"],
  "Marked as ordered. Waiting for delivery": ["ऑर्डर किया गया। डिलीवरी का इंतज़ार", "ऑर्डर केले. डिलिव्हरीची प्रतीक्षा"],
  "Customer notified on WhatsApp": ["ग्राहक को WhatsApp पर सूचित किया", "ग्राहकाला WhatsApp वर कळवले"],
  "{name} added to your team": ["{name} आपकी टीम में जोड़ा गया", "{name} तुमच्या टीममध्ये जोडले"],
  "Matched {plate} · {vehicle}": ["{plate} · {vehicle} मिला", "{plate} · {vehicle} जुळले"],
  "{plate} is already billed": ["{plate} का बिल बन चुका है", "{plate} चे बिल आधीच झाले आहे"],
  "No job card for {plate}. Create work.": ["{plate} का कोई जॉब कार्ड नहीं। काम बनाएँ।", "{plate} साठी जॉब कार्ड नाही. काम तयार करा."],
  "Calling {name}…": ["{name} को कॉल कर रहे हैं…", "{name} ला कॉल करत आहे…"],
};

let current: Lang = "en";
try {
  const saved = localStorage.getItem("lang") as Lang | null;
  if (saved && LANGS.some((l) => l.code === saved)) current = saved;
} catch {
  /* storage unavailable */
}
if (typeof document !== "undefined") document.documentElement.lang = current;

const listeners = new Set<() => void>();

export function setLang(l: Lang) {
  current = l;
  try {
    localStorage.setItem("lang", l);
  } catch {
    /* storage unavailable */
  }
  document.documentElement.lang = l;
  listeners.forEach((fn) => fn());
}

export function useLang(): Lang {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => current,
  );
}

export function tr(key: string, vars?: Record<string, string | number>): string {
  const row = D[key];
  let s = current === "en" || !row ? key : row[current === "hi" ? 0 : 1];
  if (vars) for (const k in vars) s = s.split(`{${k}}`).join(String(vars[k]));
  return s;
}

// Translates data labels such as "Oil filter · Mann" or "Timing belt, battery" segment by segment.
export function tl(s: string): string {
  return s
    .split(/( · |, )/)
    .map((part) => (part === " · " || part === ", " ? part : tr(part)))
    .join("");
}
