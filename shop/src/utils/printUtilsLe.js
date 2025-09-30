
export const printInvoice = (invoiceData, staffName, dateTime) => {
    const formatVND = (amount) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    };

    const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Hóa đơn bán lẻ</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Times New Roman', Times, serif;
                    padding: 40px;
                    width: 100%;
                    background: white;
                    font-size: 20pt;
                    color: #000;
                    line-height: 1.5;
                }
                
                h2 {
                    text-align: center;
                    font-size: 20pt;
                    margin-bottom: 16px;
                }
                
                h3 {
                    margin-top: 24px;
                    margin-bottom: 12px;
                    font-size: 20pt;
                    border-bottom: 1px solid #ccc;
                    padding-bottom: 4px;
                }
                
                .section-title {
                    text-align: center;
                    font-size: 24pt;
                    margin-bottom: 24px;
                    font-weight: bold;
                }
                
                p {
                    margin: 4px 0;
                    font-size: 20pt;
                }
                
                .customer-info {
                    margin-bottom: 16px;
                    padding: 8px;
                    border: 1px solid #ddd;
                    background-color: #f9f9f9;
                }
                
                .payment-highlight {
                    margin-bottom: 16px;
                    padding: 15px;
                    background-color: #f5f5f5;
                    border: 2px solid #d4380d;
                }
                
                .payment-highlight p {
                    margin: 0;
                    font-size: 20pt;
                    font-weight: bold;
                }
                
                .payment-amount {
                    font-size: 24pt;
                    font-weight: bold;
                    color: #d4380d;
                    display: inline-block;
                    margin-left: 10px;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 8px;
                    font-size: 11pt;
                }
                
                table th,
                table td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: left;
                }
                
                table th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                }
                
                .text-center {
                    text-align: center;
                }
                
                .text-right {
                    text-align: right;
                }
                
                .payment-summary {
                    margin-top: 16px;
                    padding: 8px;
                    border-top: 2px solid #000;
                }
                
                .payment-summary p {
                    margin: 4px 0;
                    font-size: 16pt;
                    text-align: right;
                }
                
                .total {
                    font-weight: bold;
                    font-size: 20pt;
                    margin-top: 8px;
                    text-align: right;
                    color: #d32f2f;
                }
                
                .signature {
                    margin-top: 40px;
                    text-align: right;
                    font-size: 20pt;
                }
                
                @media print {
                    body {
                        padding: 20px;
                    }
                    
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                }
            </style>
        </head>
        <body>
            <h2 class="section-title">Chi tiết hóa đơn - ${invoiceData.invoiceCode || 'N/A'}</h2>
            
            <div class="customer-info">
                <p><strong>Khách hàng:</strong> ${invoiceData.customerName || "Khách lẻ"}</p>
                <p><strong>SĐT:</strong> ${invoiceData.customerPhone || "N/A"}</p>
                <p><strong>Ngày:</strong> ${dateTime}</p>
                <p><strong>Nhân viên:</strong> ${staffName}</p>
            </div>

            <div class="payment-highlight">
                <p>
                    Khách cần trả:
                    <span class="payment-amount">${formatVND(invoiceData.customerPayment)}</span>
                </p>
            </div>

            <h3>Chi tiết sản phẩm</h3>
            <table>
                <thead>
                    <tr>
                        <th>Tên sản phẩm</th>
                        <th class="text-center" style="width: 100px;">Số lượng</th>
                        <th class="text-right" style="width: 150px;">Đơn giá</th>
                        <th class="text-right" style="width: 150px;">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${invoiceData.items.map(item => `
                        <tr>
                            <td>${item.tenSanPham}</td>
                            <td class="text-center">${item.soLuong}</td>
                            <td class="text-right">${formatVND(item.giaBan)}</td>
                            <td class="text-right">${formatVND(item.soLuong * item.giaBan)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="payment-summary">
                <p>Giảm giá: ${formatVND(invoiceData.discount || 0)}</p>
                <h3 class="total">Tổng tiền: ${formatVND(invoiceData.customerPayment)}</h3>
            </div>

            <div class="signature">
                <p>Người lập hóa đơn: ________________________</p>
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    
    if (printWindow) {
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
        printWindow.focus();
        
        // Đợi content load xong rồi mới in
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.print();
                printWindow.onafterprint = function() {
                    printWindow.close();
                };
            }, 250);
        };
    } else {
        alert('Vui lòng cho phép mở pop-up để in hóa đơn!');
    }
};