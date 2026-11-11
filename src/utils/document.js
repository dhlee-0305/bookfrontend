export const DOCUMENT_CATEGORIES = ['AI', '관리', '설계', '기타']
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024

export function validateDocument({ category, file }, isEdit = false) {
  if (!DOCUMENT_CATEGORIES.includes(category)) return '카테고리를 선택해주세요.'
  if (!file) return isEdit ? '' : '업로드할 Markdown 파일을 선택해주세요.'
  const title = file.name
  if (!title.endsWith('.md') || title.length <= 3) return '.md 확장자의 Markdown 파일을 선택해주세요.'
  if (new TextEncoder().encode(title).length > 240) return '파일명은 UTF-8 기준 240바이트 이내여야 합니다.'
  const forbidden = [...title].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127 || '<>:"/\\|?*'.includes(char))
  if (title.trim() !== title || title.startsWith('.') || forbidden || /^(con|prn|aux|nul|com[1-9¹²³]|lpt[1-9¹²³])(?:\.|$)/i.test(title)) return '경로 문자, 제어 문자, 선행 마침표 또는 Windows 예약 파일명은 사용할 수 없습니다.'
  if (file.size > MAX_DOCUMENT_SIZE) return '파일 크기는 10MB 이하여야 합니다.'
  return ''
}

export async function validateDocumentEncoding(file) {
  const bytes = await file.arrayBuffer()
  try {
    const content = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return content.includes('\0') ? 'NUL 문자가 포함된 파일은 업로드할 수 없습니다.' : ''
  } catch {
    return 'UTF-8 형식의 Markdown 파일을 선택해주세요.'
  }
}

export const formatDocumentDate = (value) => new Date(value).toLocaleString('ko-KR')
