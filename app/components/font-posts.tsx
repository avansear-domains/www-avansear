import { formatDate, getFontPosts } from '../mifavoritafonts/utils'
import { LucideFolder, LucideFile } from 'lucide-react'

export function FontPosts() {
  let allFonts = getFontPosts()

  return (
    <div>
      {allFonts
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1
          }
          return 1
        })
        .map((font) => (
          <a
            key={font.slug}
            className="flex flex-col space-y-1 mb-4 cursor-pointer"
            href={font.downloadUrl || '#'}
            download
          >
            <div className="w-full flex flex-row space-x-2 items-center">
              {font.metadata.type === 'file' ? (
                <LucideFile className="w-4 h-4 flex-shrink-0 text-[var(--color-light-80)]" />
              ) : (
                <LucideFolder className="w-4 h-4 flex-shrink-0 text-[var(--color-light-80)]" />
              )}
              <p className="text-[var(--color-light-80)] w-fit tracking-tighter whitespace-nowrap flex-shrink-0">
                {formatDate(font.metadata.publishedAt, false)}
              </p>
              <p className="text-[var(--color-dark)] dark:text-[var(--color-light)] tracking-tighter truncate">
                {font.metadata.title}
              </p>
            </div>
          </a>
        ))}
    </div>
  )
}

