# 🏨 Sistema Tongou - Controle de Disjuntores Inteligentes para Hotéis

![Status](https://img.shields.io/badge/Status-Funcional-brightgreen)
![API](https://img.shields.io/badge/API-Tuya%20Cloud-blue)
![IA](https://img.shields.io/badge/IA-Google%20Gemini-orange)
![CORS](https://img.shields.io/badge/CORS-Cloudflare%20Worker-yellow)

## 📋 Descrição do Projeto

O **Sistema Tongou** é um painel web desenvolvido para controlar disjuntores inteligentes **SY1 WiFi Switch** em ambientes hoteleiros. O sistema permite monitoramento remoto, controle automatizado e análise inteligente do consumo energético através da integração com a **API Tuya Cloud** e análise por **IA do Google Gemini**.

### 🎯 Principais Funcionalidades

- **Controle Remoto**: Liga/desliga disjuntores via interface web
- **Monitoramento em Tempo Real**: Potência, tensão, corrente, temperatura
- **Modos Rápidos**: Check-in, check-out, manutenção e hóspede
- **Agendamento**: Comandos automáticos por horário
- **Análise IA**: Diagnósticos técnicos e relatórios gerenciais
- **Relatórios**: Consumo energético e estimativas de custo

## 🔧 Como Funciona

### Arquitetura do Sistema

```
[Painel Web] ↔️ [Cloudflare Worker] ↔️ [Tuya Cloud API] ↔️ [Disjuntor SY1]
                     ↕️
                [Google Gemini API]
```

1. **Frontend**: Interface web em HTML/CSS/JavaScript
2. **CORS Proxy**: Cloudflare Worker para resolver problemas de CORS
3. **API Tuya**: Comunicação com o disjuntor inteligente
4. **IA Gemini**: Análise e diagnóstico dos dados

## � Como Replicar o Experimento

### Pré-requisitos

1. **Disjuntor SY1 WiFi Switch** configurado no app Tuya Smart
2. **Conta Tuya Developer** (https://developer.tuya.com/)
3. **API Key do Google Gemini** (https://ai.google.dev/)
4. **Conta Cloudflare** para o Worker (opcional, mas recomendado)

### Passo 1: Configurar a API Tuya

1. **Criar Projeto na Tuya**:
   - Acesse https://developer.tuya.com/
   - Crie um novo projeto tipo "Smart Home"
   - Anote o `Client ID` e `Client Secret`

2. **Vincular o Dispositivo**:
   - Na seção "Devices", adicione seu disjuntor SY1
   - Anote o `Device ID` (formato: `eb4995d7b51c09a5e7058p`)

3. **Configurar APIs**:
   - Habilite as APIs: `IoT Core`, `Authorization`, `Smart Home Family`
   - Configure as permissões de leitura e escrita

### Passo 2: Configurar o Proxy CORS (Recomendado)

Crie um **Cloudflare Worker** com o código em `cloudflare-worker.js`:

```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Extrair a URL de destino dos parâmetros
    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
      return new Response('URL de destino necessária', { status: 400 });
    }

    // Preparar a requisição para a API Tuya
    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });

    try {
      // Fazer a requisição para a API Tuya
      const response = await fetch(modifiedRequest);
      const responseBody = await response.text();

      // Retornar com headers CORS
      return new Response(responseBody, {
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, client_id, sign, t, sign_method, access_token',
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      return new Response(`Erro: ${error.message}`, { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain'
        }
      });
    }
  }
};
```

### Passo 3: Configurar as Credenciais

No arquivo `index.html`, localize e configure:

```javascript
// API Tuya - Configure suas credenciais
const config = {
    clientId: 'SEU_CLIENT_ID_AQUI',
    clientSecret: 'SEU_CLIENT_SECRET_AQUI', 
    baseUrl: 'https://openapi.tuyaus.com', // ou tuyaeu.com para Europa
    userId: 'SEU_USER_ID_AQUI' // App UID da conta Tuya
};

// API Gemini - Configure sua chave
const apiKey = "SUA_API_KEY_GEMINI_AQUI";
```

### Passo 4: Executar o Sistema

1. Coloque os arquivos em um servidor web (Apache, Nginx, etc.)
2. Acesse `index.html` pelo navegador
3. Insira suas credenciais na tela de login
4. Clique em "Conectar e Carregar Dispositivos"

## 📡 Endpoints da API Tuya Utilizados

### 1. Autenticação
```http
GET /v1.0/token?grant_type=1
Headers:
  client_id: SEU_CLIENT_ID
  sign: ASSINATURA_CALCULADA
  t: TIMESTAMP
  sign_method: HMAC-SHA256
```

### 2. Listar Dispositivos
```http
GET /v1.0/users/SEU_USER_ID/devices
Headers:
  access_token: TOKEN_OBTIDO
  client_id: SEU_CLIENT_ID
  sign: ASSINATURA_CALCULADA
  t: TIMESTAMP
```

### 3. Status do Dispositivo
```http
GET /v1.0/devices/DEVICE_ID/status
Headers:
  access_token: TOKEN_OBTIDO
  client_id: SEU_CLIENT_ID
  sign: ASSINATURA_CALCULADA
  t: TIMESTAMP
```

### 4. Enviar Comando
```http
POST /v1.0/devices/DEVICE_ID/commands
Headers:
  access_token: TOKEN_OBTIDO
  client_id: SEU_CLIENT_ID
  sign: ASSINATURA_CALCULADA
  t: TIMESTAMP
  Content-Type: application/json

Body:
{
  "commands": [
    {
      "code": "switch",
      "value": true
    }
  ]
}
```
**Retorno**: `access_token`, `refresh_token`, `uid`

#### **2. Status do Dispositivo**
```http
GET /v1.0/devices/{device_id}/status
Host: openapi.tuyaus.com
Authorization: Bearer {access_token}
```
**Função**: Obter status atual do disjuntor
**Retorno**: Array com propriedades do dispositivo:
- `switch`: Estado ligado/desligado
- `countdown_1`: Timer ativo (segundos)
- `child_lock`: Trava de segurança
- `cur_power`: Potência atual (se disponível)
- `cur_voltage`: Tensão atual (se disponível)
- `cur_current`: Corrente atual (se disponível)

#### **3. Envio de Comandos**
```http
POST /v1.0/devices/{device_id}/commands
Host: openapi.tuyaus.com
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "commands": [
    {
      "code": "switch",
      "value": true
    }
  ]
}
```

## 🎮 Comandos Disponíveis

### Comandos Básicos
| Comando | Código | Valores | Descrição |
|---------|--------|---------|-----------|
| Ligar/Desligar | `switch` | `true`/`false` | Controla o estado do disjuntor |
| Timer | `countdown_1` | `0-86400` | Timer em segundos (0 = desligar) |
| Trava | `child_lock` | `true`/`false` | Trava de segurança |

### Comandos Avançados
| Comando | Código | Valores | Descrição |
|---------|--------|---------|-----------|
| Modo LED | `light_mode` | `relay`/`on`/`none`/`pos` | Comportamento do LED |
| Relay Status | `relay_status` | `last`/`power_on`/`power_off` | Ação após falha de energia |

### Monitoramento
| Propriedade | Código | Unidade | Descrição |
|-------------|--------|---------|-----------|
| Corrente | `cur_current` | mA | Corrente instantânea |
| Potência | `cur_power` | W | Potência instantânea |
| Tensão | `cur_voltage` | V | Tensão instantânea |
| Energia Total | `total_forward_energy` | kWh | Energia acumulada |
| Temperatura | `temp_current` | °C | Temperatura do dispositivo |

## 🏨 Modos Rápidos para Hotel

### 1. Modo Check-out
```javascript
// Liga o disjuntor e configura timer de 30 minutos
await api.sendCommand(deviceId, 'switch', true);
await api.sendCommand(deviceId, 'countdown_1', 1800);
```

### 2. Modo Manutenção  
```javascript
// Desliga e trava o disjuntor
await api.sendCommand(deviceId, 'switch', false);
await api.sendCommand(deviceId, 'child_lock', true);
```

### 3. Modo Hóspede
```javascript
// Liga, destrava e configura LED
await api.sendCommand(deviceId, 'switch', true);
await api.sendCommand(deviceId, 'child_lock', false);
await api.sendCommand(deviceId, 'light_mode', 'relay');
```

## 🤖 Integração com IA (Gemini)

O sistema utiliza a API do Google Gemini para:

### Análise Técnica
- Diagnóstico de problemas
- Avaliação de segurança
- Recomendações de manutenção

### Relatórios Gerenciais
- Análise de consumo energético
- Estimativas de custo
- Otimizações sugeridas

### Exemplo de Prompt
```javascript
const prompt = `
Você é um assistente de engenharia elétrica especializado em manutenção hoteleira.
Analise estes dados do disjuntor:

DADOS: ${JSON.stringify(deviceStatus, null, 2)}

Forneça:
1. 🔍 DIAGNÓSTICO
2. ⚠️ PRIORIDADE  
3. 🛠️ AÇÕES IMEDIATAS
4. 📋 GUIA TÉCNICO
5. 🏨 IMPACTO NO HÓSPEDE
6. 🔒 SEGURANÇA
`;
```

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Erro de CORS
**Sintoma**: "Access to fetch blocked by CORS policy"
**Solução**: Use o Cloudflare Worker ou configure CORS no servidor

#### 2. Token Inválido
**Sintoma**: "Invalid access token" 
**Solução**: Verifique Client ID, Secret e calcule a assinatura corretamente

#### 3. Dispositivo Não Encontrado
**Sintoma**: Lista de dispositivos vazia
**Solução**: Verifique se o dispositivo está vinculado à conta Tuya correta

#### 4. Comandos Não Funcionam
**Sintoma**: Comando enviado mas dispositivo não responde
**Solução**: Verifique se o dispositivo está online e os códigos estão corretos

### Debug e Logs

O sistema possui logs detalhados que podem ser visualizados:

```javascript
// Habilitar logs
function log(message, data) {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`, data);
    // Logs também aparecem na interface
}
```

## 📊 Exemplos de Uso

### Controle Básico
```javascript
// Ligar o disjuntor
await api.sendCommand('eb4995d7b51c09a5e7058p', 'switch', true);

// Configurar timer de 1 hora
await api.sendCommand('eb4995d7b51c09a5e7058p', 'countdown_1', 3600);

// Verificar status
const status = await api.getDeviceStatus('eb4995d7b51c09a5e7058p');
```

### Agendamento
```javascript
// Agendar check-in às 15:00
scheduleCommand(deviceId, 'checkin', '15:00', 'switch', true);

// Agendar check-out às 12:00  
scheduleCommand(deviceId, 'checkout', '12:00', 'switch', false);
```

### Monitoramento
```javascript
// Obter dados de energia
const energyData = status.filter(s => 
    ['cur_current', 'cur_power', 'cur_voltage', 'total_forward_energy'].includes(s.code)
);

// Calcular custo estimado
const powerW = energyData.find(s => s.code === 'cur_power')?.value / 10;
const costPerHour = (powerW * 0.65) / 1000; // R$ 0,65/kWh
```

## 🔐 Segurança

### Boas Práticas
1. **Nunca exponha** credenciais no código fonte
2. **Use HTTPS** sempre que possível  
3. **Implemente rate limiting** para evitar spam de comandos
4. **Monitore logs** para detectar uso anormal
5. **Configure timeouts** para comandos críticos

### Limitações da API Tuya
- Rate limit: ~100 requisições/minuto
- Token expira em 2 horas
- Alguns comandos podem ter delay de 1-3 segundos

## 📞 Suporte

### Recursos Úteis
- **Documentação Tuya**: https://developer.tuya.com/en/docs
- **API Gemini**: https://ai.google.dev/docs
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/

### Dispositivos Testados
- ✅ **SY1 WiFi Switch** (Modelo principal testado)
- ✅ **Tomadas inteligentes Tuya** (Compatibilidade parcial)
- ⚠️ **Outros disjuntores** (Podem ter códigos diferentes)

## 📄 Estrutura de Arquivos

```
tongou/
├── index.html              # Interface principal
├── cloudflare-worker.js    # Proxy CORS
├── README.md              # Este arquivo
└── docs/                  # Documentação adicional
    ├── API-examples.md
    └── troubleshooting.md
```

## 🎯 Próximos Passos

- [ ] Interface mobile responsiva
- [ ] Suporte a múltiplos dispositivos
- [ ] Persistência de agendamentos
- [ ] Dashboard de gestão hoteleira
- [ ] Integração com sistemas PMS
- [ ] Alertas por email/SMS

---

## 📝 Licença

Este projeto é fornecido "como está" para fins educacionais e experimentais. Use por sua conta e risco.

**⚠️ Aviso**: Sempre teste em ambiente controlado antes de usar em produção. Disjuntores controlam sistemas elétricos críticos.

---

*Desenvolvido para demonstrar a integração entre APIs IoT, análise por IA e gestão hoteleira moderna.*
