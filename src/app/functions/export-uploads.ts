import { PassThrough, Transform } from 'stream'
import { db, pg } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeRight } from '@/infra/shared/either'
import { uploadFileToStorage } from '@/infra/storage/upload-file-to-storage'
import { stringify } from 'csv-stringify'
import { asc, count, desc, ilike } from 'drizzle-orm'
import { pipeline } from 'stream/promises'
import { z } from 'zod'

const exportUploadsInput = z.object({
  searchQuery: z.string().optional(),
})

type ExportUploadsInput = z.input<typeof exportUploadsInput>

type ExportUploadsOutput = {
  reportUrl: string
}

export async function exportUploads(
  input: ExportUploadsInput
): Promise<Either<never, ExportUploadsOutput>> {
  const { searchQuery } = exportUploadsInput.parse(input)

  const { sql, params } = db
    .select({
      id: schema.uploads.id,
      name: schema.uploads.name,
      remoteUrl: schema.uploads.remoteUrl,
      createdAt: schema.uploads.createdAt,
    })
    .from(schema.uploads)
    .where(
      searchQuery ? ilike(schema.uploads.name, `%${searchQuery}%`) : undefined
    )
    .toSQL()

  const cursor = pg.unsafe(sql, params as string[]).cursor(50)

  // for await (const rows of cursor) {
  //   console.log(rows)
  // }

  const csv = stringify({
    delimiter: ',', // colunas separadas por virgula
    header: true, // nome das colunas
    columns: [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'remote_url', header: 'URL' },
      { key: 'created_at', header: 'Uploaded at' },
    ],
  })

  // It passes the input bytes across to the output
  const uploadToStorageStream = new PassThrough()

  // Readable / Transform / Transform / Transform / Transform / Writable
  const convertToCSVPipeline = pipeline(
    cursor,
    new Transform({
      objectMode: true,
      transform(chunks: unknown[], encoding, callback) {
        for (const chunk of chunks) {
          this.push(chunk)
        }
        callback()
      },
    }),
    csv,
    // stream de escrita no Cloudflare R2
    uploadToStorageStream
  )

  const uploadToStorage = uploadFileToStorage({
    contentType: 'text/csv',
    folder: 'downloads',
    fileName: `${new Date().toISOString()}-uploads.csv`,
    contentStream: uploadToStorageStream,
  })

  const [{ url }] = await Promise.all([uploadToStorage, convertToCSVPipeline])

  return makeRight({ reportUrl: url })
}
