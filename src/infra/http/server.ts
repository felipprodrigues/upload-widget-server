import { fastifyCors } from '@fastify/cors'
import fastify from 'fastify'

const server = fastify()

// Registra o cors e libera todas as origens de chamadas
server.register(fastifyCors, { origin: '*' })

server.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('HTTP server running!')
})
