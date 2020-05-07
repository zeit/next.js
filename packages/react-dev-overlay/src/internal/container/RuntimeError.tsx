import * as React from 'react'
import { StackFrame } from 'stacktrace-parser'
import { CodeFrame } from '../components/CodeFrame'
import { noop as css } from '../helpers/noop-template'
import { getFrameSource, OriginalStackFrame } from '../helpers/stack-frame'
import { ReadyRuntimeError } from './Errors'

export type RuntimeErrorProps = { className?: string; error: ReadyRuntimeError }

const CallStackFrame: React.FC<{
  frame: OriginalStackFrame
}> = function CallStackFrame({ frame }) {
  // TODO: ability to expand resolved frames
  // TODO: render error or external indicator

  const f: StackFrame = frame.originalStackFrame ?? frame.sourceStackFrame
  const hasSource = Boolean(frame.originalCodeFrame)

  const open = React.useCallback(() => {
    if (!hasSource) return

    const params = new URLSearchParams()
    for (const key in f) {
      params.append(key, (f[key] ?? '').toString())
    }

    self.fetch(`/__nextjs_launch-editor?${params.toString()}`).then(
      () => {},
      () => {
        // TODO: report error
      }
    )
  }, [hasSource, f])

  return (
    <div data-nextjs-call-stack-frame>
      <h6>
        {frame.expanded ? (
          undefined
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        )}
        {f.methodName}
      </h6>
      <div
        data-has-source={hasSource ? 'true' : undefined}
        tabIndex={hasSource ? 10 : undefined}
        role={hasSource ? 'link' : undefined}
        onClick={open}
        title={hasSource ? 'Click to open in your editor' : undefined}
      >
        <span>{getFrameSource(f)}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </div>
    </div>
  )
}

const RuntimeError: React.FC<RuntimeErrorProps> = function RuntimeError({
  className,
  error,
}) {
  const firstFirstPartyFrameIndex = React.useMemo<number>(() => {
    return error.frames.findIndex(
      entry =>
        entry.expanded &&
        Boolean(entry.originalCodeFrame) &&
        Boolean(entry.originalStackFrame)
    )
  }, [error.frames])
  const firstFrame = React.useMemo<OriginalStackFrame | null>(() => {
    return error.frames[firstFirstPartyFrameIndex] ?? null
  }, [error.frames, firstFirstPartyFrameIndex])

  const allLeadingFrames = React.useMemo<OriginalStackFrame[]>(
    () =>
      firstFirstPartyFrameIndex < 0
        ? []
        : error.frames.slice(0, firstFirstPartyFrameIndex),
    [error.frames, firstFirstPartyFrameIndex]
  )

  const [all, setAll] = React.useState(firstFrame == null)
  const toggleAll = React.useCallback(() => {
    setAll(v => !v)
  }, [])

  const leadingFrames = React.useMemo(
    () => allLeadingFrames.filter(f => f.expanded || all),
    [all, allLeadingFrames]
  )
  const allCallStackFrames = React.useMemo<OriginalStackFrame[]>(
    () => error.frames.slice(firstFirstPartyFrameIndex + 1),
    [error.frames, firstFirstPartyFrameIndex]
  )
  const visibleCallStackFrames = React.useMemo<OriginalStackFrame[]>(
    () => allCallStackFrames.filter(f => f.expanded || all),
    [all, allCallStackFrames]
  )

  const canShowMore = React.useMemo<boolean>(() => {
    return (
      allCallStackFrames.length !== visibleCallStackFrames.length ||
      (all && firstFrame != null)
    )
  }, [
    all,
    allCallStackFrames.length,
    firstFrame,
    visibleCallStackFrames.length,
  ])

  return (
    <div className={className}>
      {firstFrame ? (
        <React.Fragment>
          <h5>Source</h5>
          {leadingFrames.map((frame, index) => (
            <CallStackFrame
              key={`leading-frame-${index}-${all}`}
              frame={frame}
            />
          ))}
          <CodeFrame
            stackFrame={firstFrame.originalStackFrame}
            codeFrame={firstFrame.originalCodeFrame}
          />
        </React.Fragment>
      ) : (
        undefined
      )}
      {visibleCallStackFrames.length ? (
        <React.Fragment>
          <h5>Call Stack</h5>
          {visibleCallStackFrames.map((frame, index) => (
            <CallStackFrame key={`call-stack-${index}-${all}`} frame={frame} />
          ))}
        </React.Fragment>
      ) : (
        undefined
      )}
      {canShowMore ? (
        <React.Fragment>
          <button
            tabIndex={10}
            data-nextjs-data-runtime-error-collapsed-action
            type="button"
            onClick={toggleAll}
          >
            {all ? 'Hide' : 'Show'} collapsed frames
          </button>
        </React.Fragment>
      ) : (
        undefined
      )}
    </div>
  )
}

export const styles = css`
  button[data-nextjs-data-runtime-error-collapsed-action] {
    background: none;
    border: none;
    padding: 0;
    color: rgba(25, 25, 25, 0.6);
  }

  [data-nextjs-call-stack-frame] > h6 {
    font-family: var(--font-stack-monospace);
    color: rgba(25, 25, 25, 1);
  }
  [data-nextjs-call-stack-frame] > h6 > svg {
    width: auto;
    height: 0.875rem;
    margin-right: 0.5rem;
  }
  [data-nextjs-call-stack-frame] > div {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    padding-left: 0.75rem;
    font-size: 0.875rem;
    color: rgba(25, 25, 25, 0.5);
  }
  [data-nextjs-call-stack-frame] > div > svg {
    width: auto;
    height: 0.875rem;
    margin-left: 0.5rem;

    display: none;
  }

  [data-nextjs-call-stack-frame] > div[data-has-source] {
    cursor: pointer;
  }
  [data-nextjs-call-stack-frame] > div[data-has-source]:hover {
    text-decoration: underline dotted;
  }
  [data-nextjs-call-stack-frame] > div[data-has-source] > svg {
    display: unset;
  }
`

export { RuntimeError }
