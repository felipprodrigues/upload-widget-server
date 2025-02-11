import { fastifyCors } from '@fastify/cors'
import fastifyMultipart from '@fastify/multipart'
import fastifySwagger from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import fastify from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { exportUploadsRoute } from './routes/export-uploads'
import { getUploadsRoute } from './routes/get-uploads'
import { uploadImageRoute } from './routes/upload-image'
import { transformSwaggerSchema } from './transform-swagger-schema'

const server = fastify()

// Valida e compila os dados de entrada das rotas - AKA qndo chamamos a rota
server.setValidatorCompiler(validatorCompiler)

// Valida e compila os dados de saída das rotas - AKA qndo retornamos da rota
server.setSerializerCompiler(serializerCompiler)

server.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Validation error',
      issue: error.validation,
    })
  }

  // Envia o erro para alguma ferramenta de observabilidade (Sentry, Datadog, Grafana, Otel)
  console.log(error)

  return reply.status(500).send({
    message: 'Internal server error',
  })
})

// Registra o cors e libera todas as origens de chamadas
server.register(fastifyCors, { origin: '*' })

// Lib para upload
server.register(fastifyMultipart)
server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Upload Server',
      version: '1.0.0',
    },
  },
  transform: transformSwaggerSchema,
})

server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})
// cadastrar rotas
server.register(uploadImageRoute)
server.register(getUploadsRoute)
server.register(exportUploadsRoute)

server.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('HTTP server running!')
})
