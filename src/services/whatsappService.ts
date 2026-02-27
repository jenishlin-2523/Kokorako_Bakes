export const sendWhatsAppOrder = (orderData: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    address: string;
    items: any[];
    total: number;
}) => {
    const adminPhone = '7418932321';

    let message = `🍰 *NEW KOKORAKO ORDER #${orderData.orderNumber}*\n`;
    message += `----------------------------\n`;
    message += `👤 *Customer:* ${orderData.customerName}\n`;
    message += `📱 *Phone:* ${orderData.customerPhone}\n`;
    message += `📍 *Address:* ${orderData.address}\n\n`;
    message += `📦 *Order Details:*\n`;

    orderData.items.forEach(item => {
        const weight = item.customization?.weight || 'Standard';
        const price = item.prices ? item.prices[weight] || 0 : 0;
        message += `🧁 *${item.name}* (${weight})\n`;
        message += `   Qty: ${item.quantity} × ₹${price} = *₹${price * item.quantity}*\n\n`;
    });

    message += `----------------------------\n`;
    message += `💰 *TOTAL AMOUNT: ₹${orderData.total}*\n`;
    message += `----------------------------\n`;
    message += `_Thank you for choosing Kokorako Bakes!_`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
};
