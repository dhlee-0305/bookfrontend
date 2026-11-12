import { useEffect, useRef, useState } from 'react'

let mermaidPromise
let diagramId = 0

function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        suppressErrorRendering: true,
      })
      return mermaid
    }).catch((error) => {
      mermaidPromise = undefined
      throw error
    })
  }
  return mermaidPromise
}

export default function MermaidDiagram({ source }) {
  const containerRef = useRef(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    let cancelled = false
    const container = containerRef.current
    container.replaceChildren()

    async function render() {
      try {
        const mermaid = await loadMermaid()
        if (cancelled) return
        const { svg } = await mermaid.render(`document-mermaid-${++diagramId}`, source)
        if (cancelled) return
        container.innerHTML = svg
        setResult({ source, error: null })
      } catch (error) {
        if (!cancelled) {
          setResult({ source, error: error instanceof Error ? error.message : String(error) })
        }
      }
    }

    render()
    return () => { cancelled = true }
  }, [source])

  const currentResult = result?.source === source ? result : null

  return (
    <div className="mermaid-diagram">
      {!currentResult && <p role="status">다이어그램을 불러오는 중입니다.</p>}
      <div ref={containerRef} className="mermaid-diagram-svg" role="img" aria-label="Mermaid 다이어그램" />
      {currentResult?.error && (
        <div role="alert">
          <p>다이어그램을 표시하지 못했습니다. Mermaid 문법을 확인해주세요.</p>
          <details>
            <summary>오류 상세 및 원문 보기</summary>
            <pre>{currentResult.error}</pre>
            <pre><code>{source}</code></pre>
          </details>
        </div>
      )}
    </div>
  )
}
