// FastifyPluginAsyncZod permite que a tipagem de entrada e saída dos dados da rota sejam reconhecidas sem
// que haja necessidade de declará-las separadamente com schema
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const uploadImageRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/uploads',
    {
      schema: {
        summary: 'Upload an image',
        body: z.object({
          name: z.string(),
          password: z.string().optional(),
        }),
        response: {
          201: z.object({ uploadId: z.string() }),
          409: z
            .object({ message: z.string() })
            .describe('Upload already exists'),
        },
      },
    },
    async (request, reply) => {
      await db.insert(schema.uploads).values({
        name: 'teste.jpg',
        remoteKey: 'test.jpg',
        remoteUrl: 'http://fwefwe.com',
      })

      return reply.status(201).send({ uploadId: 'test' })
    }
  )
}
