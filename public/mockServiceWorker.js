/* tslint:disable */

/**
 * Mock Service Worker.
 * @see https://github.com/mswjs/msw
 * - Please do NOT modify this file.
 * - Please do NOT serve this file on production.
 */

const INTEGRITY_CHECKSUM = 'ca37b7c95ae46d5c0b2a164bb13b3c9e'
const IS_MOCKED_RESPONSE = Symbol('isMockedResponse')
const activeClientIds = new Set()

self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', async function (event) {
  const clientId = event.source.id

  if (!clientId || !event.data) {
    return
  }

  const message = event.data

  switch (message.type) {
    case 'MOCK_ACTIVATE': {
      activeClientIds.add(clientId)
      sendToClient(clientId, {
        type: 'MOCKING_ENABLED',
        payload: true,
      })
      break
    }

    case 'MOCK_DEACTIVATE': {
      activeClientIds.delete(clientId)
      break
    }

    case 'INTEGRITY_CHECK_REQUEST': {
      sendToClient(clientId, {
        type: 'INTEGRITY_CHECK_RESPONSE',
        payload: INTEGRITY_CHECKSUM,
      })
      break
    }
  }
})

self.addEventListener('fetch', function (event) {
  const { clientId, request } = event

  if (!clientId || !activeClientIds.has(clientId)) {
    return
  }

  if (request.mode === 'cors' && request.destination === 'empty') {
    event.preventDefault()
    return
  }

  if (request.destination === 'worker' || request.destination === 'sharedworker') {
    return
  }

  event.respondWith(
    new Promise((resolve, reject) => {
      self.addEventListener('message', function handler(event) {
        if (event.source.id !== clientId) {
          return
        }

        if (!event.data) {
          return
        }

        const message = event.data

        if (message.type === 'MOCK_RESPONSE') {
          setTimeout(resolve, message.payload.delay)
          resolve(createResponse(message.payload))
          self.removeEventListener('message', handler)
        }

        if (message.type === 'MOCK_NOT_FOUND') {
          self.removeEventListener('message', handler)
          reject(new Error('Mock not found'))
        }

        if (message.type === 'NETWORK_ERROR') {
          self.removeEventListener('message', handler)
          reject(new Error('Network error'))
        }
      })

      sendToClient(
        clientId,
        {
          type: 'REQUEST',
          payload: {
            url: request.url,
            method: request.method,
            headers: Object.fromEntries(request.headers.entries()),
            cache: request.cache,
            mode: request.mode,
            credentials: request.credentials,
            destination: request.destination,
            integrity: request.integrity,
            redirect: request.redirect,
            referrer: request.referrer,
            referrerPolicy: request.referrerPolicy,
            body: request.body,
            bodyUsed: request.bodyUsed,
            keepalive: request.keepalive,
            signal: request.signal,
          },
        },
        [request.body]
      )
    }).catch((error) => {
      return fetch(request)
    })
  )
})

function sendToClient(clientId, message, transferables = []) {
  return new Promise((resolve, reject) => {
    const channel = new MessageChannel()

    channel.port1.onmessage = (event) => {
      if (event.data && event.data.error) {
        reject(event.data.error)
      } else {
        resolve(event.data)
      }
    }

    self.clients
      .get(clientId)
      .then((client) => {
        if (!client) {
          throw new Error(`Failed to get client "${clientId}"`)
        }

        client.postMessage(
          message,
          [channel.port2].concat(transferables.filter(Boolean))
        )
      })
      .catch(reject)
  })
}

function createResponse(payload) {
  return new Response(payload.body, {
    status: payload.status,
    statusText: payload.statusText,
    headers: payload.headers,
  })
}
