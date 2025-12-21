import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

const execAsync = promisify(exec)

const RATE_LIMIT_FILE = join(process.cwd(), '.data', 'musix-rate-limit.json')
const MAX_EXECUTIONS = 50
const WINDOW_HOURS = 24

interface RateLimitData {
  executions: number[]
}

async function ensureDataDir() {
  const dataDir = join(process.cwd(), '.data')
  if (!existsSync(dataDir)) {
    await mkdir(dataDir, { recursive: true })
  }
}

async function getRateLimitData(): Promise<RateLimitData> {
  await ensureDataDir()
  
  if (!existsSync(RATE_LIMIT_FILE)) {
    return { executions: [] }
  }
  
  try {
    const content = await readFile(RATE_LIMIT_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return { executions: [] }
  }
}

async function saveRateLimitData(data: RateLimitData) {
  await ensureDataDir()
  await writeFile(RATE_LIMIT_FILE, JSON.stringify(data, null, 2))
}

function cleanOldExecutions(executions: number[]): number[] {
  const now = Date.now()
  const windowMs = WINDOW_HOURS * 60 * 60 * 1000
  return executions.filter(timestamp => now - timestamp < windowMs)
}

async function checkRateLimit(): Promise<{ allowed: boolean; remaining: number }> {
  const data = await getRateLimitData()
  const cleanedExecutions = cleanOldExecutions(data.executions)
  
  if (cleanedExecutions.length >= MAX_EXECUTIONS) {
    return { allowed: false, remaining: 0 }
  }
  
  return { allowed: true, remaining: MAX_EXECUTIONS - cleanedExecutions.length }
}

async function recordExecution() {
  const data = await getRateLimitData()
  const cleanedExecutions = cleanOldExecutions(data.executions)
  cleanedExecutions.push(Date.now())
  await saveRateLimitData({ executions: cleanedExecutions })
}

async function runFetchScript(): Promise<{ success: boolean; output: string; error?: string }> {
  const scriptPath = join(process.cwd(), 'app', 'musix', 'fetch_songs.py')
  
  // Try different Python paths (anaconda first, then system python3)
  const pythonPaths = [
    '/opt/anaconda3/bin/python',
    '/usr/local/bin/python3',
    'python3',
    'python'
  ]
  
  let lastError: any = null
  
  for (const pythonPath of pythonPaths) {
    try {
      // Test if this Python has the required modules
      const testCmd = `"${pythonPath}" -c "import dotenv; import googleapiclient.discovery" 2>&1`
      await execAsync(testCmd)
      
      // If we get here, this Python works - run the script
      const { stdout, stderr } = await execAsync(`"${pythonPath}" "${scriptPath}"`)
      return {
        success: true,
        output: stdout || stderr || 'Script executed successfully',
      }
    } catch (error: any) {
      lastError = error
      // Try next Python path
      continue
    }
  }
  
  // If we get here, none of the Python paths worked
  return {
    success: false,
    output: lastError?.stdout || '',
    error: lastError?.stderr || lastError?.message || 'No suitable Python interpreter found with required packages',
  }
}

export async function GET() {
  try {
    // Check rate limit
    const rateLimit = await checkRateLimit()
    
    if (!rateLimit.allowed) {
      return Response.json(
        { 
          success: false, 
          message: 'Rate limit exceeded. Maximum 5 executions per 24 hours.',
          remaining: 0
        },
        { status: 429 }
      )
    }
    
    // Record execution
    await recordExecution()
    
    // Run the script
    const result = await runFetchScript()
    
    if (!result.success) {
      return Response.json(
        { 
          success: false, 
          message: 'Script execution failed',
          output: result.output,
          error: result.error,
          remaining: rateLimit.remaining - 1
        },
        { status: 500 }
      )
    }
    
    return Response.json({
      success: true,
      message: 'Songs fetched successfully',
      output: result.output,
      remaining: rateLimit.remaining - 1
    })
  } catch (error: any) {
    return Response.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error.message 
      },
      { status: 500 }
    )
  }
}

