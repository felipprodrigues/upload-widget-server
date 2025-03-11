// FastifyPluginAsyncZod permite que a tipagem de entrada e saída dos dados da rota sejam reconhecidas sem
// que haja necessidade de declará-las separadamente com schema
import { InvalidFileFormat } from '@/app/functions/errors/invalid-file-format'
import { uploadImage } from '@/app/functions/upload-image'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { isRight, unwrapEither } from '@/infra/shared/either'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const uploadImageRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/uploads',
    {
      schema: {
        summary: 'Upload an image',
        tags: ['uploads'],
        // fazer com que a rota receba o formato de file
        // See: transform-swagger-schema.ts
        consumes: ['multipart/form-data'],
        response: {
          201: z.object({ url: z.string() }).describe('Image upload.'),
          400: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const uploadedFile = await request.file({
        limits: {
          fileSize: 1024 * 1024 * 2, // 2mb
        },
      })

      if (!uploadedFile) {
        return reply.status(400).send({ message: 'File is required.' })
      }

      const result = await uploadImage({
        fileName: uploadedFile.filename,
        contentType: uploadedFile.mimetype,
        contentStream: uploadedFile.file,
      })

      // Se o arquivo for maior que 2mb, retornamos essa msg
      //  e o bucket do cloudFlare interromperá e apagará o arquivo
      // em 7 dias (configuracao opcional)
      if (uploadedFile.file.truncated) {
        return reply.status(400).send({
          message: 'File size limit reached.',
        })
      }

      // Success
      if (isRight(result)) {
        const { url } = unwrapEither(result)

        return reply.status(201).send({ url })
      }

      // Error
      const error = unwrapEither(result)
      switch (error.constructor.name) {
        case 'InvalidFileFormat':
          return reply.status(400).send({ message: error.message })
      }
    }
  )
}
