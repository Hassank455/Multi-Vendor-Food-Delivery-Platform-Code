import fs from 'node:fs/promises'
import path from 'node:path'
import { execSync } from 'node:child_process'

async function getAllFiles(dirPath, filesList = []) {
  const files = await fs.readdir(dirPath)

  for (const file of files) {
    const filePath = path.join(dirPath, file)

    if ((await fs.stat(filePath)).isDirectory())
      await getAllFiles(filePath, filesList)
    else if (filePath.endsWith('.ts')) filesList.push(filePath)
  }

  return filesList
}

;(async () => {
  // read schema.prisma and comment out DATABASE_URL to generate
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')
  let schemaContent = await fs.readFile(schemaPath, 'utf8')
  schemaContent = schemaContent.replace(
    /^(?!\/\/)(.*DATABASE_URL.*)/gm,
    '// $1',
  )
  await fs.writeFile(schemaPath, schemaContent)
  execSync('pnpm prisma:generate', { stdio: 'inherit' })

  // read files to modify
  const zenstackDir = path.join(process.cwd(), 'src/generated/zenstack')

  const filesToProcess = await getAllFiles(zenstackDir)

  // prepare updates
  const updateTasks = filesToProcess.map(async (filePath) => {
    let content = await fs.readFile(filePath, 'utf8')
    let modified = false

    // replace @prisma with @/generated/prisma for zenstack/
    if (filePath.includes('zenstack') && content.includes('@prisma')) {
      content = content.replace(/@prisma/g, '@/generated/prisma')
      modified = true
    }

    // add @ts-nocheck for zenstack/zod/ and pothos
    const isZod = filePath.includes(path.join('zenstack', 'zod'))

    if (isZod && !content.startsWith('// @ts-nocheck')) {
      content = `// @ts-nocheck\n${content}`
      modified = true
    }

    if (modified) return fs.writeFile(filePath, content)
  })

  await Promise.all(updateTasks)
})()
