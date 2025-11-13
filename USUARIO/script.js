document.addEventListener('DOMContentLoaded', (event) => {
    
    
    const paymentRadios = document.querySelectorAll('input[name="pagamento"]');
    const parcelamentoArea = document.getElementById('parcelamento-area');
    const cartaoInfo = document.getElementById('cartao-info');
    const selectInstallments = document.getElementById('installments');
    const totalAmountSpan = document.querySelector('.checkout-summary .total strong');
    
    
    const totalCompraText = totalAmountSpan.textContent.replace('R$', '').replace(',', '.').trim();
    const totalCompra = parseFloat(totalCompraText); 
    const maxInstallments = 10;  
    const freeInstallments = 3;   
    const monthlyInterestRate = 0.015; 

    
    function formatCurrency(value) {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    
    function calculateInstallments() {
        if (isNaN(totalCompra)) {
            selectInstallments.innerHTML = '<option>Erro: Total do pedido inválido.</option>';
            return;
        }

        selectInstallments.innerHTML = ''; 

        for (let i = 1; i <= maxInstallments; i++) {
            let installmentValue;
            let totalFinal;
            let description = '';

            if (i <= freeInstallments) {
                
                installmentValue = totalCompra / i;
                totalFinal = totalCompra;
                description = i > 1 ? ` (SEM JUROS)` : ` (à vista)`;
            } else {
                
                const totalInterest = totalCompra * monthlyInterestRate * (i - freeInstallments);
                totalFinal = totalCompra + totalInterest;
                installmentValue = totalFinal / i;
                
                const interestPercent = (totalFinal / totalCompra - 1) * 100;
                description = ` (Juros de ${interestPercent.toFixed(1)}% no total)`;
            }
            
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}x de ${formatCurrency(installmentValue)} (Total: ${formatCurrency(totalFinal)})${description}`;
            
            selectInstallments.appendChild(option);
        }
        
        
        totalAmountSpan.textContent = formatCurrency(totalCompra);
    }
    
    
    function updatePaymentUI() {
        const selectedPayment = document.querySelector('input[name="pagamento"]:checked').value;

        if (selectedPayment === 'cartao') {
            parcelamentoArea.style.display = 'block';
            cartaoInfo.style.display = 'block';
        } else {
            parcelamentoArea.style.display = 'none';
            cartaoInfo.style.display = 'none';
            
            totalAmountSpan.textContent = formatCurrency(totalCompra);
        }
    }
    
    
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', updatePaymentUI);
    });

    selectInstallments.addEventListener('change', (e) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        
        
        const totalMatch = selectedOption.textContent.match(/Total:\s*(R\$\s*[\d\.,]+)/);
        
        if (totalMatch && totalMatch[1]) {
            const newTotalText = totalMatch[1].replace('R$', '').replace('.', '').replace(',', '.').trim();
            const newTotal = parseFloat(newTotalText);
            
            if (!isNaN(newTotal)) {
                totalAmountSpan.textContent = formatCurrency(newTotal);
            }
        }
    });

    
    calculateInstallments();
    updatePaymentUI();
});
