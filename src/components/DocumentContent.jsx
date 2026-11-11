import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function DocumentContent({ content }) {
  return content ? (
    <div className="document-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  ) : <p className="text-sm text-gray-400">본문이 없습니다.</p>
}
