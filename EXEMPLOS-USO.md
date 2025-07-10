# 🎯 Exemplos Práticos - Sistema Tongou

## 📋 Cenários Reais de Uso Hoteleiro

Este documento fornece **exemplos práticos** de como usar o Sistema Tongou em situações reais de gestão hoteleira.

---

## 🏨 Cenário 1: Check-in de Hóspede

### Situação
Hóspede chegando às 15:00 no Quarto 101. Necessário preparar o quarto.

### Processo Manual Tradicional
1. Recepcionista liga para governança
2. Governança vai fisicamente ao quarto
3. Liga o disjuntor manualmente
4. Verifica se tudo está funcionando
5. Retorna para central

### Com Sistema Tongou

#### Passo 1: Verificação Remota
```javascript
// Verificar status atual do quarto
const status = await api.getDeviceStatus('eb4995d7b51c09a5e7058p');
console.log('Status Quarto 101:', status);
```

#### Passo 2: Preparação Automática
```javascript
// Executar modo check-in
async function checkinQuarto101() {
    try {
        // Liga o disjuntor
        await api.sendCommand('eb4995d7b51c09a5e7058p', 'switch', true);
        
        // Remove trava de segurança
        await api.sendCommand('eb4995d7b51c09a5e7058p', 'child_lock', false);
        
        // Configura LED para indicar ocupação
        await api.sendCommand('eb4995d7b51c09a5e7058p', 'light_mode', 'relay');
        
        // Configura comportamento após falha de energia
        await api.sendCommand('eb4995d7b51c09a5e7058p', 'relay_status', 'power_on');
        
        log('✅ Quarto 101 preparado para check-in');
        
    } catch (error) {
        log('❌ Erro na preparação do quarto:', error);
    }
}
```

#### Passo 3: Confirmação
```javascript
// Verificar se comandos foram executados
setTimeout(async () => {
    const statusFinal = await api.getDeviceStatus('eb4995d7b51c09a5e7058p');
    const isLigado = statusFinal.find(s => s.code === 'switch')?.value;
    
    if (isLigado) {
        log('✅ Quarto 101 pronto para receber hóspede');
        // Notificar recepção via sistema
    }
}, 3000);
```

---

## 🚪 Cenário 2: Check-out com Economia

### Situação
Hóspede faz check-out às 11:30. Quarto precisa ser liberado de forma econômica.

### Processo com Tongou

#### Modo Check-out Inteligente
```javascript
async function checkoutEconomico() {
    try {
        // Liga temporariamente para governança limpar
        await api.sendCommand('eb4995d7b51c09a5e7058p', 'switch', true);
        log('🔌 Energia ligada para limpeza');
        
        // Timer de 30 minutos para limpeza
        await api.sendCommand('eb4995d7b51c09a5e7058p', 'countdown_1', 1800);
        log('⏰ Timer: 30min para limpeza');
        
        // Após limpeza, trava para evitar uso acidental
        setTimeout(async () => {
            await api.sendCommand('eb4995d7b51c09a5e7058p', 'child_lock', true);
            log('🔒 Quarto travado após limpeza');
        }, 1800000); // 30 minutos
        
    } catch (error) {
        log('❌ Erro no check-out:', error);
    }
}
```

#### Estimativa de Economia
```javascript
async function calcularEconomia() {
    const status = await api.getDeviceStatus('eb4995d7b51c09a5e7058p');
    const potencia = status.find(s => s.code === 'cur_power')?.value || 0;
    
    const potenciaW = potencia / 10; // Converter de deciWatts
    const consumoPorHora = potenciaW / 1000; // kWh
    const tarifaEnergia = 0.65; // R$ por kWh
    
    const economiaHora = consumoPorHora * tarifaEnergia;
    const economiaNoite = economiaHora * 12; // 12h dormindo
    
    log(`💰 Economia estimada: R$ ${economiaNoite.toFixed(2)} por noite vazia`);
}
```

---

## 🔧 Cenário 3: Manutenção Preventiva

### Situação
Quarto 102 precisa de manutenção elétrica. Segurança é prioridade.

### Protocolo de Segurança
```javascript
async function manutencaoSegura() {
    try {
        // 1. Desliga imediatamente
        await api.sendCommand('eb4995d7b51c09a5e7059q', 'switch', false);
        log('🔴 Energia desligada - Quarto 102');
        
        // 2. Trava para evitar religamento acidental
        await api.sendCommand('eb4995d7b51c09a5e7059q', 'child_lock', true);
        log('🔒 Trava ativada - Segurança');
        
        // 3. Configura LED para indicar manutenção
        await api.sendCommand('eb4995d7b51c09a5e7059q', 'light_mode', 'on');
        log('🔧 LED indica: MANUTENÇÃO');
        
        // 4. Registra no log
        const timestamp = new Date().toLocaleString();
        log(`📋 Manutenção iniciada: ${timestamp}`);
        
        // 5. Notifica equipe de manutenção
        alert('⚠️ Quarto 102 em MANUTENÇÃO - Energia travada');
        
    } catch (error) {
        log('❌ Erro no protocolo de manutenção:', error);
    }
}
```

### Finalizar Manutenção
```javascript
async function finalizarManutencao() {
    const confirmacao = confirm('Manutenção concluída? Liberar quarto?');
    
    if (confirmacao) {
        // Destrava
        await api.sendCommand('eb4995d7b51c09a5e7059q', 'child_lock', false);
        
        // Volta ao modo normal
        await api.sendCommand('eb4995d7b51c09a5e7059q', 'light_mode', 'relay');
        
        log('✅ Quarto 102 liberado da manutenção');
    }
}
```

---

## 🌙 Cenário 4: Gestão Noturna Automatizada

### Situação
Hotel quer economia automática durante madrugada (00:00 - 06:00).

### Agendamento Automático
```javascript
// Configurar economia noturna
function configurarEconomiaNoturna() {
    const dispositivos = [
        'eb4995d7b51c09a5e7058p', // Quarto 101
        'eb4995d7b51c09a5e7059q', // Quarto 102
        'eb4995d7b51c09a5e7060r'  // Quarto 103
    ];
    
    dispositivos.forEach(deviceId => {
        // Agendar desligamento às 00:00
        scheduleCommand(deviceId, 'economia-noturna', '00:00', 'switch', false);
        
        // Agendar religamento às 06:00
        scheduleCommand(deviceId, 'reativacao-manha', '06:00', 'switch', true);
    });
    
    log('🌙 Economia noturna configurada para todos os quartos');
}
```

### Monitoramento de Ocupação
```javascript
async function verificarOcupacao() {
    const quartos = [
        { id: 'eb4995d7b51c09a5e7058p', nome: 'Quarto 101' },
        { id: 'eb4995d7b51c09a5e7059q', nome: 'Quarto 102' },
        { id: 'eb4995d7b51c09a5e7060r', nome: 'Quarto 103' }
    ];
    
    for (const quarto of quartos) {
        const status = await api.getDeviceStatus(quarto.id);
        const potencia = status.find(s => s.code === 'cur_power')?.value || 0;
        
        if (potencia > 100) { // > 10W indica uso
            log(`🏨 ${quarto.nome}: OCUPADO (${potencia/10}W)`);
        } else {
            log(`🛏️ ${quarto.nome}: VAZIO (${potencia/10}W)`);
        }
    }
}
```

---

## ⚡ Cenário 5: Alerta de Sobrecarga

### Situação
Detector automático de consumo anormal que pode indicar problemas.

### Monitor de Consumo
```javascript
async function monitorarConsumo() {
    const dispositivos = ['eb4995d7b51c09a5e7058p', 'eb4995d7b51c09a5e7059q'];
    
    for (const deviceId of dispositivos) {
        const status = await api.getDeviceStatus(deviceId);
        
        const potencia = status.find(s => s.code === 'cur_power')?.value / 10; // Watts
        const corrente = status.find(s => s.code === 'cur_current')?.value; // mA
        const tensao = status.find(s => s.code === 'cur_voltage')?.value / 10; // Volts
        const temperatura = status.find(s => s.code === 'temp_current')?.value; // °C
        
        // Verificar limites de segurança
        if (potencia > 2000) {
            alert(`⚠️ SOBRECARGA: ${potencia}W no dispositivo ${deviceId}`);
        }
        
        if (corrente > 10000) { // 10A
            alert(`⚠️ CORRENTE ALTA: ${corrente}mA no dispositivo ${deviceId}`);
        }
        
        if (temperatura > 60) {
            alert(`🔥 TEMPERATURA ALTA: ${temperatura}°C no dispositivo ${deviceId}`);
        }
        
        // Log normal
        log(`📊 ${deviceId}: ${potencia}W, ${corrente}mA, ${temperatura}°C`);
    }
}

// Executar monitoramento a cada 5 minutos
setInterval(monitorarConsumo, 300000);
```

---

## 📊 Cenário 6: Relatório Gerencial

### Situação
Gerente precisa de relatório de consumo energético do hotel.

### Relatório Diário
```javascript
async function gerarRelatorioGerencial() {
    const quartos = [
        { id: 'eb4995d7b51c09a5e7058p', nome: 'Quarto 101' },
        { id: 'eb4995d7b51c09a5e7059q', nome: 'Quarto 102' },
        { id: 'eb4995d7b51c09a5e7060r', nome: 'Quarto 103' }
    ];
    
    let relatorio = `📋 RELATÓRIO ENERGÉTICO - ${new Date().toLocaleDateString()}\n\n`;
    let consumoTotal = 0;
    let custoTotal = 0;
    
    for (const quarto of quartos) {
        const status = await api.getDeviceStatus(quarto.id);
        
        const energiaTotal = status.find(s => s.code === 'total_forward_energy')?.value || 0;
        const potenciaAtual = status.find(s => s.code === 'cur_power')?.value / 10;
        const isLigado = status.find(s => s.code === 'switch')?.value;
        
        const consumoKwh = energiaTotal / 1000; // Converter para kWh
        const custoQuarto = consumoKwh * 0.65; // R$ 0,65/kWh
        
        consumoTotal += consumoKwh;
        custoTotal += custoQuarto;
        
        relatorio += `🏨 ${quarto.nome}:\n`;
        relatorio += `   Status: ${isLigado ? '🟢 Ligado' : '🔴 Desligado'}\n`;
        relatorio += `   Potência: ${potenciaAtual}W\n`;
        relatorio += `   Consumo: ${consumoKwh.toFixed(2)} kWh\n`;
        relatorio += `   Custo: R$ ${custoQuarto.toFixed(2)}\n\n`;
    }
    
    relatorio += `💰 TOTAIS:\n`;
    relatorio += `   Consumo: ${consumoTotal.toFixed(2)} kWh\n`;
    relatorio += `   Custo: R$ ${custoTotal.toFixed(2)}\n`;
    relatorio += `   Média/quarto: R$ ${(custoTotal/quartos.length).toFixed(2)}`;
    
    // Exibir relatório
    const reportDiv = document.getElementById('relatorio-container');
    reportDiv.innerHTML = `<pre>${relatorio}</pre>`;
    
    // Enviar para IA para análise
    await analisarConsumoIA(relatorio);
}
```

### Análise por IA
```javascript
async function analisarConsumoIA(dadosRelatorio) {
    const prompt = `
Você é um consultor em eficiência energética hoteleira. 
Analise este relatório de consumo e forneça:

${dadosRelatorio}

📋 ANÁLISE SOLICITADA:
1. 💡 EFICIÊNCIA: O consumo está normal?
2. 🎯 OPORTUNIDADES: Onde economizar?
3. 📈 TENDÊNCIAS: Padrões identificados
4. ⚠️ ALERTAS: Problemas potenciais
5. 📊 BENCHMARKS: Comparação com padrões hoteleiros
6. 🔧 AÇÕES: Recomendações específicas
`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        const analise = data.candidates[0].content.parts[0].text;
        
        // Exibir análise
        document.getElementById('analise-ia').innerHTML = 
            `<h3>🤖 Análise Inteligente</h3><pre>${analise}</pre>`;
            
    } catch (error) {
        log('❌ Erro na análise IA:', error);
    }
}
```

---

## 🎮 Cenário 7: Controle de Emergência

### Situação
Emergência no hotel - necessário desligar todos os disjuntores rapidamente.

### Botão de Emergência
```javascript
async function emergenciaGeral() {
    const confirmacao = confirm('🚨 EMERGÊNCIA: Desligar TODOS os disjuntores?');
    
    if (!confirmacao) return;
    
    const dispositivos = [
        'eb4995d7b51c09a5e7058p',
        'eb4995d7b51c09a5e7059q', 
        'eb4995d7b51c09a5e7060r'
    ];
    
    log('🚨 INICIANDO DESLIGAMENTO DE EMERGÊNCIA');
    
    // Desligar todos simultaneamente
    const promessas = dispositivos.map(async (deviceId, index) => {
        try {
            await api.sendCommand(deviceId, 'switch', false);
            log(`🔴 Quarto ${101 + index}: DESLIGADO`);
        } catch (error) {
            log(`❌ Erro no Quarto ${101 + index}:`, error);
        }
    });
    
    await Promise.all(promessas);
    
    // Registrar emergência
    const timestamp = new Date().toLocaleString();
    log(`📋 EMERGÊNCIA CONCLUÍDA: ${timestamp}`);
    
    alert('🚨 Todos os disjuntores foram desligados!');
}
```

---

## 📱 Cenário 8: Interface Mobile

### Situação
Governança precisa controlar quartos via smartphone.

### Funções Simplificadas
```javascript
// Interface touch-friendly para mobile
function criarBotoesMobile() {
    const container = document.getElementById('mobile-controls');
    
    const quartos = [
        { id: 'eb4995d7b51c09a5e7058p', nome: '101' },
        { id: 'eb4995d7b51c09a5e7059q', nome: '102' },
        { id: 'eb4995d7b51c09a5e7060r', nome: '103' }
    ];
    
    quartos.forEach(quarto => {
        const button = document.createElement('button');
        button.className = 'mobile-room-button';
        button.innerHTML = `
            <div class="room-number">${quarto.nome}</div>
            <div class="room-status" id="status-${quarto.id}">...</div>
        `;
        
        button.onclick = () => alternarQuarto(quarto.id);
        container.appendChild(button);
    });
}

async function alternarQuarto(deviceId) {
    try {
        // Vibração no mobile (se suportado)
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
        
        // Buscar status atual
        const status = await api.getDeviceStatus(deviceId);
        const isLigado = status.find(s => s.code === 'switch')?.value;
        
        // Alternar estado
        await api.sendCommand(deviceId, 'switch', !isLigado);
        
        // Feedback visual
        const statusElement = document.getElementById(`status-${deviceId}`);
        statusElement.textContent = !isLigado ? '🟢 ON' : '🔴 OFF';
        statusElement.style.color = !isLigado ? 'green' : 'red';
        
    } catch (error) {
        alert(`Erro: ${error.message}`);
    }
}
```

---

## 🎯 Resumo dos Benefícios

### Economias Reais
- **30-50%** redução no consumo de quartos vazios
- **R$ 50-200/mês** economia por quarto dependendo da ocupação
- **Eliminação** de desperdício por esquecimento

### Operacionais
- **Controle remoto** elimina deslocamentos desnecessários
- **Agendamentos** automatizam rotinas
- **Logs detalhados** para auditoria

### Segurança
- **Desligamento remoto** em emergências
- **Travas** impedem uso não autorizado
- **Monitoramento** detecta problemas antes que se tornem críticos

### Gestão
- **Relatórios automáticos** para decisões baseadas em dados
- **Análise IA** identifica oportunidades de otimização
- **Integração** futura com sistemas PMS hoteleiros

---

**💡 Estes exemplos mostram o potencial real do Sistema Tongou na gestão hoteleira moderna!**
