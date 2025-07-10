# 📋 Guia Completo de Configuração - Sistema Tongou

## 🎯 Objetivo

Este guia fornece instruções **detalhadas e específicas** para replicar o experimento de controle de disjuntores inteligentes em hotéis, desde a configuração inicial até o uso avançado.

---

## 🔧 Configuração da API Tuya - Passo a Passo

### Etapa 1: Criar Conta Developer na Tuya

1. **Acesse**: https://developer.tuya.com/
2. **Clique em**: "Sign Up" (se não tiver conta)
3. **Preencha**: Email, senha e dados básicos
4. **Verifique**: Email de confirmação
5. **Faça login** na plataforma

### Etapa 2: Criar um Novo Projeto

1. **Na dashboard**, clique em **"Cloud"** → **"Projects"**
2. **Clique**: "Create Cloud Project"
3. **Preencha**:
   - **Project Name**: "Hotel Switch Control"
   - **Description**: "Controle de disjuntores para hotéis"
   - **Industry**: "Smart Home" ou "Hospitality"
   - **Data Center**: Escolha baseado na localização:
     - **Americas**: `https://openapi.tuyaus.com`
     - **Europe**: `https://openapi.tuyaeu.com`
     - **China**: `https://openapi.tuyacn.com`

4. **Clique**: "Create"

### Etapa 3: Obter as Credenciais

Após criar o projeto, você verá:

```
📋 CREDENCIAIS DO PROJETO:
Client ID: 4gw6pw3k7xxxxxxxx (20 caracteres)
Client Secret: 0e6e4fxxxxxxxxxx (32 caracteres)
```

**⚠️ IMPORTANTE**: Anote essas credenciais em local seguro!

### Etapa 4: Configurar APIs Necessárias

1. **No projeto**, vá para **"API Services"**
2. **Habilite as seguintes APIs**:
   - ✅ **IoT Core** (controle de dispositivos)
   - ✅ **Authorization** (autenticação)
   - ✅ **Smart Home Family** (gestão de dispositivos)
   - ✅ **Device Status Notification** (status em tempo real)

3. **Para cada API**, clique em **"Subscribe"**

### Etapa 5: Vincular Dispositivos

#### Método 1: Via App Smart Life (Recomendado)
1. **Baixe**: App "Smart Life" (iOS/Android)
2. **Crie conta** com o mesmo email da Tuya Developer
3. **Adicione o disjuntor SY1**:
   - Abra o app
   - Toque em "+" → "Add Device"
   - Siga o wizard de configuração WiFi
   - **Anote o Device ID** que aparece nas configurações

#### Método 2: Via Pairing Token
1. **Na Tuya Developer**, vá para **"Devices"**
2. **Clique**: "Link Tuya App Account"
3. **Escaneie** o QR Code com o app Smart Life
4. **Dispositivos aparecerão** automaticamente na lista

### Etapa 6: Obter o User ID

**Opção A - Via API**:
```bash
curl -X GET "https://openapi.tuyaus.com/v1.0/apps/your_app_id/user" \
  -H "client_id: SEU_CLIENT_ID" \
  -H "access_token: SEU_TOKEN"
```

**Opção B - Via Interface**:
1. Na Tuya Developer → **"Devices"**
2. Clique em qualquer dispositivo
3. **User ID** aparece nas informações do dispositivo

---

## 🌐 Configuração do Cloudflare Worker

### Etapa 1: Criar Conta Cloudflare

1. **Acesse**: https://cloudflare.com/
2. **Clique**: "Sign Up" (plano gratuito serve)
3. **Confirme** o email

### Etapa 2: Criar Worker

1. **Dashboard Cloudflare** → **"Workers & Pages"**
2. **Clique**: "Create application"
3. **Selecione**: "Create Worker"
4. **Nome**: `tuya-cors-proxy`
5. **Clique**: "Deploy"

### Etapa 3: Configurar o Código

1. **Clique**: "Edit code"
2. **Substitua** todo o conteúdo por:

```javascript
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, client_id, sign, t, sign_method, access_token',
          'Access-Control-Max-Age': '86400',
        }
      });
    }

    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');
    
    if (!targetUrl) {
      return new Response('Parâmetro "url" é obrigatório', { 
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    try {
      // Clone the request to avoid modifying the original
      const modifiedRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });

      const response = await fetch(modifiedRequest);
      const responseBody = await response.text();

      return new Response(responseBody, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, client_id, sign, t, sign_method, access_token',
          'Content-Type': response.headers.get('Content-Type') || 'application/json'
        }
      });

    } catch (error) {
      return new Response(`Erro no proxy: ${error.message}`, {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};
```

3. **Clique**: "Save and Deploy"

### Etapa 4: Obter URL do Worker

Após o deploy, você receberá uma URL como:
```
https://tuya-cors-proxy.SEU_USUARIO.workers.dev
```

**Anote esta URL** - você vai precisar no código!

---

## 🤖 Configuração da API Gemini

### Etapa 1: Criar Conta Google AI Studio

1. **Acesse**: https://ai.google.dev/
2. **Clique**: "Get started" → "Get API key"
3. **Faça login** com conta Google

### Etapa 2: Gerar API Key

1. **Google AI Studio** → **"Get API key"**
2. **Clique**: "Create API key in new project"
3. **Copie** a chave gerada (formato: `AIzaSy...`)

### Etapa 3: Testar a API

```bash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "Teste de conectividade"}]
    }]
  }'
```

---

## 💻 Configuração do Código

### Etapa 1: Baixar/Clonar os Arquivos

```bash
# Opção 1: Download direto
# Baixe index.html e cloudflare-worker.js

# Opção 2: Git clone (se disponível)
git clone https://github.com/usuario/tongou-system.git
```

### Etapa 2: Configurar Credenciais

**Abra**: `index.html` em um editor de texto

**Localize** (aproximadamente linha 50):
```javascript
// API Tuya - CONFIGURE AQUI
const config = {
    clientId: 'SEU_CLIENT_ID_AQUI',
    clientSecret: 'SEU_CLIENT_SECRET_AQUI', 
    baseUrl: 'https://openapi.tuyaus.com', // Escolha: tuyaus, tuyaeu, ou tuyacn
    userId: 'SEU_USER_ID_AQUI' // UID do app Tuya
};
```

**Substitua**:
- `SEU_CLIENT_ID_AQUI` → Client ID da Tuya
- `SEU_CLIENT_SECRET_AQUI` → Client Secret da Tuya  
- `SEU_USER_ID_AQUI` → User ID obtido anteriormente

**Localize** (aproximadamente linha 60):
```javascript
// API Gemini - CONFIGURE AQUI
const apiKey = "SUA_API_KEY_GEMINI_AQUI";
```

**Substitua**:
- `SUA_API_KEY_GEMINI_AQUI` → API Key do Gemini

**Localize** (aproximadamente linha 70):
```javascript
// Cloudflare Worker - CONFIGURE AQUI (se usar)
const corsProxyUrl = 'https://tuya-cors-proxy.SEU_USUARIO.workers.dev';
```

**Substitua**:
- `SEU_USUARIO` → URL do seu Cloudflare Worker

### Etapa 3: Configurar o Dispositivo

**No código**, localize a função `loadDevices()` e configure:

```javascript
// IDs dos seus dispositivos
const deviceMappings = {
    'eb4995d7b51c09a5e7058p': 'Quarto 101 - Disjuntor A',
    'OUTRO_DEVICE_ID_AQUI': 'Quarto 102 - Disjuntor B'
    // Adicione mais dispositivos conforme necessário
};
```

---

## 🚀 Executar o Sistema

### Opção 1: Servidor Local (Recomendado)

#### Com XAMPP:
```bash
# 1. Coloque os arquivos em:
C:\xampp\htdocs\tongou\

# 2. Inicie o XAMPP
# 3. Acesse:
http://localhost/tongou/
```

#### Com Python:
```bash
# 1. Entre na pasta do projeto
cd /caminho/para/tongou

# 2. Execute servidor HTTP
python -m http.server 8000

# 3. Acesse:
http://localhost:8000
```

#### Com Node.js:
```bash
# 1. Instale servidor estático
npm install -g live-server

# 2. Entre na pasta e execute
cd /caminho/para/tongou
live-server

# 3. Abre automaticamente no navegador
```

### Opção 2: GitHub Pages

1. **Crie repositório** no GitHub
2. **Faça upload** dos arquivos
3. **Settings** → **Pages** → **Source**: "Deploy from branch"
4. **Acesse**: `https://seuusuario.github.io/tongou`

---

## 🧪 Teste de Funcionamento

### Teste 1: Autenticação

1. **Abra** o sistema no navegador
2. **Insira** as credenciais configuradas
3. **Clique**: "Conectar e Carregar Dispositivos"
4. **Resultado esperado**: Lista de dispositivos aparece

### Teste 2: Controle Básico

1. **Selecione** um dispositivo
2. **Clique**: "Ligar" ou "Desligar"
3. **Resultado esperado**: Status muda em 2-5 segundos

### Teste 3: Monitoramento

1. **Verifique** se dados de energia aparecem
2. **Resultado esperado**: Potência, tensão, corrente exibidos

### Teste 4: IA Gemini

1. **Clique**: "Analisar com IA"
2. **Resultado esperado**: Relatório detalhado gerado

---

## ❌ Problemas Comuns e Soluções

### Erro: "CORS blocked"
**Causa**: Browser bloqueia requisições cross-origin
**Solução**: Use o Cloudflare Worker ou execute via servidor HTTP

### Erro: "Invalid signature"  
**Causa**: Assinatura HMAC-SHA256 incorreta
**Solução**: Verifique se Client ID e Secret estão corretos

### Erro: "Token expired"
**Causa**: Token de acesso venceu (dura 2 horas)
**Solução**: Sistema renova automaticamente, aguarde ou recarregue

### Erro: "Device not found"
**Causa**: Device ID incorreto ou dispositivo não vinculado
**Solução**: Verifique o Device ID no app Smart Life

### Erro: "Gemini API failed"
**Causa**: API Key inválida ou rate limit excedido
**Solução**: Verifique a chave ou aguarde rate limit resetar

---

## 📊 Dados de Exemplo

### Device Status Response:
```json
{
  "result": [
    {
      "code": "switch",
      "value": true
    },
    {
      "code": "cur_power", 
      "value": 1250
    },
    {
      "code": "cur_voltage",
      "value": 2198
    },
    {
      "code": "cur_current",
      "value": 568
    },
    {
      "code": "countdown_1",
      "value": 0
    }
  ]
}
```

### Command Request:
```json
{
  "commands": [
    {
      "code": "switch",
      "value": true
    }
  ]
}
```

---

## 🎯 Próximos Passos

Após conseguir executar o sistema básico:

1. **Personalize** nomes dos dispositivos/quartos
2. **Configure** agendamentos automáticos  
3. **Teste** modos rápidos (check-in/check-out)
4. **Analise** relatórios de energia
5. **Implemente** melhorias específicas do seu hotel

---

## 📞 Suporte

Se encontrar problemas:

1. **Verifique** todas as credenciais
2. **Consulte** logs no Developer Tools (F12)
3. **Teste** cada API individualmente
4. **Documente** o erro exato para buscar ajuda

---

**✅ Com este guia, você deve conseguir replicar 100% do experimento!**
