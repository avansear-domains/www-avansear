function getWorkerUrl(): string {
  const workerUrl = process.env.CLOUDFLARE_WORKER_URL
  if (!workerUrl) {
    throw new Error('Missing CLOUDFLARE_WORKER_URL')
  }
  return workerUrl.replace(/\/$/, '')
}

export function isWorkerUploadConfigured(): boolean {
  return Boolean(process.env.CLOUDFLARE_WORKER_URL)
}

export async function uploadFileViaWorker(file: File) {
  const workerUrl = getWorkerUrl()
  const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : undefined
  const safeExt = extension && /^[a-z0-9]+$/.test(extension) ? extension : 'bin'
  const objectKey = `feed/${Date.now()}-${crypto.randomUUID()}.${safeExt}`
  const encodedKey = objectKey
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')

  const fileBuffer = await file.arrayBuffer()

  const response = await fetch(`${workerUrl}/${encodedKey}`, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
    body: fileBuffer,
  })

  const data = (await response.json().catch(() => ({}))) as {
    url?: string
    objectKey?: string
    error?: string
  }

  if (!response.ok) {
    throw new Error(data.error || `Worker upload failed: HTTP ${response.status}`)
  }

  return {
    objectKey: data.objectKey || objectKey,
    url: data.url || `${workerUrl}/${objectKey}`,
  }
}
