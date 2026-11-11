import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { documentImageUrl } from '../utils/document'

export default function DocumentContent({ content, imageBaseUrl }) {
  return content ? (
    <div className="document-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ img: DocumentImage }} urlTransform={(url, key, node) => {
        const safeUrl = defaultUrlTransform(url)
        return key === 'src' && node.tagName === 'img' ? documentImageUrl(safeUrl, imageBaseUrl) : safeUrl
      }}>{content}</ReactMarkdown>
    </div>
  ) : <p className="text-sm text-gray-400">본문이 없습니다.</p>
}

function DocumentImage({ src, alt, title }) {
  return src ? <img src={src} alt={alt} title={title} loading="lazy" /> : <span>{alt}</span>
}
