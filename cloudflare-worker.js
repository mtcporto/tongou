// Cloudflare Worker para resolver CORS da API Tuya
// Deploy este código em: https://tongou.mosaicoworkers.workers.dev/

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Permitir apenas métodos HTTP necessários
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  
  if (!allowedMethods.includes(request.method)) {
    return new Response('Method not allowed', { status: 405 })
  }

  // Responder a requisições OPTIONS (preflight)
  if (request.method === 'OPTIONS') {
    return handleCORS()
  }

  try {
    // Extrair a URL da API Tuya dos parâmetros
    const url = new URL(request.url)
    const targetUrl = url.searchParams.get('url')
    
    if (!targetUrl) {
      return new Response('URL parameter is required', { status: 400 })
    }

    // Verificar se a URL é da API Tuya (segurança)
    if (!targetUrl.includes('openapi.tuya')) {
      return new Response('Only Tuya API URLs are allowed', { status: 403 })
    }

    // Criar nova requisição para a API Tuya
    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' ? request.body : null
    })

    // Fazer a requisição para a API Tuya
    const response = await fetch(modifiedRequest)
    
    // Criar nova resposta com headers CORS
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400'
      }
    })

    return modifiedResponse

  } catch (error) {
    return new Response(`Proxy error: ${error.message}`, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      }
    })
  }
}

function handleCORS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400'
    }
  })
}
