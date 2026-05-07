import { OpenAI } from 'openai'

type EmbeddedDoc = {
  embedding: number[]
  [key: string]: unknown
}

const createOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return null
  }

  return new OpenAI({ apiKey })
}

const generateEmbedding = async (client: OpenAI | null, text: string): Promise<number[] | null> => {
  if (!client) return null

  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  return response.data[0].embedding
}

const calculateCosineSimilarity = (vectorA: number[], vectorB: number[]): number => {
  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0)
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0))
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0))

  return dotProduct / (magnitudeA * magnitudeB)
}

const findTopMatches = <T extends EmbeddedDoc>(
  queryEmbedding: number[],
  documents: T[],
  topK = 3,
): (T & { similarity: number })[] => {
  return documents
    .map((doc) => ({
      ...doc,
      similarity: calculateCosineSimilarity(queryEmbedding, doc.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
}

export const rag = {
  createClient: createOpenAIClient,
  generateEmbedding,
  findTopMatches,
}
