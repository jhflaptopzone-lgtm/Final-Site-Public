// JHF AI WhatsApp Order Automation Engine
// Automatically formats and dispatches customer orders directly to the owner's WhatsApp (01935-693071)
// and updates the enterprise order management system.

export const OWNER_WHATSAPP = '8801935693071';
export const OWNER_DISPLAY_PHONE = '01935-693071';

export interface OrderAutomationPayload {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  district: string;
  productName: string;
  productCodeOrSku?: string;
  price: number;
  quantity?: number;
  advancePaid?: number;
  paymentMethod: string;
  deliveryNote?: string;
  sourceZone?: 'Recondition Zone' | 'Catalog' | 'Quick Order' | string;
  language?: 'en' | 'bn' | 'hi';
}

/**
 * Generates an automated, highly structured WhatsApp notification for the business owner
 */
export function generateAiWhatsAppOrderMessage(data: OrderAutomationPayload): string {
  const lang = data.language || 'bn';
  const qty = data.quantity || 1;
  const total = data.price * qty;
  const advance = data.advancePaid || 0;
  const dueAmount = Math.max(0, total - advance);

  if (lang === 'en') {
    const dateStr = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date());

    return `🚨 *NEW ORDER ALERT! (JHF LAPTOP ZONE)* 🚨
━━━━━━━━━━━━━━━━━━━━━━━━
📋 *Order ID:* #${data.orderNumber}
🕒 *Date & Time:* ${dateStr}
🏷️ *Source:* ${data.sourceZone || 'Website Order'}

👤 *Customer Information:*
• *Name:* ${data.customerName}
• *Phone:* ${data.customerPhone}
• *Delivery Address:* ${data.deliveryAddress}
• *District / Area:* ${data.district}

💻 *Ordered Product Details:*
• *Product:* ${data.productName}
${data.productCodeOrSku ? `• *Code / SKU:* ${data.productCodeOrSku}\n` : ''}• *Quantity:* ${qty} unit(s)
• *Total Amount:* ৳${total.toLocaleString()}

💳 *Payment & Delivery Status:*
• *Payment Method:* ${data.paymentMethod}
• *Advance Paid:* ৳${advance.toLocaleString()}
• *Cash on Delivery (Due):* ৳${dueAmount.toLocaleString()}
${data.deliveryNote ? `• *Special Note:* ${data.deliveryNote}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━
⚡ *Automated AI Notification: JHF Laptop Zone Smart System*`;
  }

  if (lang === 'hi') {
    const dateStr = new Intl.DateTimeFormat('hi-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date());

    return `🚨 *नया ऑर्डर अलर्ट! (JHF LAPTOP ZONE)* 🚨
━━━━━━━━━━━━━━━━━━━━━━━━
📋 *ऑर्डर आईडी:* #${data.orderNumber}
🕒 *दिनांक और समय:* ${dateStr}
🏷️ *स्रोत:* ${data.sourceZone || 'Website Order'}

👤 *ग्राहक विवरण:*
• *नाम:* ${data.customerName}
• *फ़ोन नंबर:* ${data.customerPhone}
• *डिलीवरी पता:* ${data.deliveryAddress}
• *ज़िला / क्षेत्र:* ${data.district}

💻 *ऑर्डर किया गया उत्पाद:*
• *उत्पाद:* ${data.productName}
${data.productCodeOrSku ? `• *कोड / SKU:* ${data.productCodeOrSku}\n` : ''}• *मात्रा:* ${qty}
• *कुल मूल्य:* ৳${total.toLocaleString()}

💳 *भुगतान और डिलीवरी स्थिति:*
• *भुगतान विधि:* ${data.paymentMethod}
• *अग्रिम भुगतान:* ৳${advance.toLocaleString()}
• *कैश ऑन डिलीवरी (बकाया):* ৳${dueAmount.toLocaleString()}
${data.deliveryNote ? `• *विशेष नोट:* ${data.deliveryNote}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━
⚡ *स्वचालित AI अधिसूचना: जेएचएफ लैपटॉप ज़ोन स्मार्ट सिस्टम*`;
  }

  const dateStr = new Intl.DateTimeFormat('bn-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());

  return `🚨 *নতুন অর্ডার অ্যালার্ট! (JHF LAPTOP ZONE)* 🚨
━━━━━━━━━━━━━━━━━━━━━━━━
📋 *অর্ডার আইডি:* #${data.orderNumber}
🕒 *তারিখ ও সময়:* ${dateStr}
🏷️ *সোর্স:* ${data.sourceZone || 'Website Order'}

👤 *কাস্টমার ইনফরমেশন:*
• *নাম:* ${data.customerName}
• *ফোন নম্বর:* ${data.customerPhone}
• *ডেলিভারি ঠিকানা:* ${data.deliveryAddress}
• *জেলা / এরিয়া:* ${data.district}

💻 *অর্ডারকৃত পণ্য বিবরণ:*
• *পণ্য:* ${data.productName}
${data.productCodeOrSku ? `• *কোড / SKU:* ${data.productCodeOrSku}\n` : ''}• *পরিমাণ:* ${qty} টি
• *মোট মূল্য:* ৳${total.toLocaleString()}

💳 *পেমেন্ট ও ডেলিভারি স্ট্যাটাস:*
• *পেমেন্ট পদ্ধতি:* ${data.paymentMethod}
• *অগ্রিম পরিশোধ:* ৳${advance.toLocaleString()}
• *ক্যাশ অন ডেলিভারি (বকেয়া):* ৳${dueAmount.toLocaleString()}
${data.deliveryNote ? `• *বিশেষ নোট:* ${data.deliveryNote}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━
⚡ *স্বয়ংক্রিয় AI নোটিফিকেশন: জেএইচএফ ল্যাপটপ জোন স্মার্ট সিস্টেম*`;
}

/**
 * Returns a direct WhatsApp URL to send the order dispatch to the owner's WhatsApp number
 */
export function getOwnerWhatsAppUrl(message: string): string {
  return `https://api.whatsapp.com/send?phone=${OWNER_WHATSAPP}&text=${encodeURIComponent(message)}`;
}

/**
 * Returns a WhatsApp URL for communicating with the customer
 */
export function getCustomerConfirmationWhatsAppUrl(data: OrderAutomationPayload): string {
  const cleanPhone = data.customerPhone.replace(/\D/g, '');
  const internationalPhone = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;

  const message = `আসসালামু আলাইকুম ${data.customerName}!
জেএইচএফ ল্যাপটপ জোন (JHF Laptop Zone)-এ আপনার অর্ডারটি গ্রহণ করা হয়েছে।
Best Laptop Buy , Sell & Accessories Importer, Traders & Suppliers

📋 অর্ডার নং: #${data.orderNumber}
💻 ল্যাপটপ: ${data.productName}
💰 মোট মূল্য: ৳${(data.price * (data.quantity || 1)).toLocaleString()}
📍 ডেলিভারি ঠিকানা: ${data.deliveryAddress}, ${data.district}

আমাদের কাস্টমার প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।
মোবাইল: 01935-693071 , 01731-693071
মূল অফিস: সোনালী ট্রেড, শপ নং: ১০০১ ও ১০৪০, ইসিএস কম্পিউটার সিটি সেন্টার, মাল্টিপ্ল্যান, নিউ এলিফ্যান্ট রোড, ঢাকা।
ব্রাঞ্চ অফিস: বাড়ইপাড়া বাজার, চন্দ্রা, গাজীপুর।
ইমেইল: jhflaptopzone@gmail.com
ফেসবুক: www.facebook.com/jhflaptopzone
ওয়েব: www.jhflaptopzone.com`;

  return `https://api.whatsapp.com/send?phone=${internationalPhone}&text=${encodeURIComponent(message)}`;
}

/**
 * Dispatches the order to the owner via WhatsApp and opens the chat in a new tab if supported
 */
export function dispatchOrderToOwner(data: OrderAutomationPayload): { whatsappUrl: string; message: string } {
  const message = generateAiWhatsAppOrderMessage(data);
  const whatsappUrl = getOwnerWhatsAppUrl(message);

  // Attempt to open WhatsApp window safely
  try {
    const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Popup blocked by browser policy; caller should render a prominent clickable button
      console.warn('WhatsApp auto-popup blocked by browser policy. Prompting user to tap to send.');
    }
  } catch (err) {
    console.error('Error opening WhatsApp dispatch:', err);
  }

  return { whatsappUrl, message };
}
