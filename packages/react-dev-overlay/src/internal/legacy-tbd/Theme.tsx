import * as React from 'react'
import { noop as css } from '../helpers/noop-template'

export function Theme() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: css`
          [data-nextjs-dialog-header] nav > span {
            font-size: 0.875rem;
            color: #757575;
            font-family: var(--font-stack-monospace);
            margin-left: 9px;
          }

          [data-nextjs-dialog-header] h4 {
            margin-bottom: 0;
            line-height: 1.5;
            margin-top: 1.2rem;
          }
          [data-nextjs-dialog-header] p {
            margin-bottom: 0;
            color: #6a6a6a;
          }
          [data-nextjs-call-stack-frame] > h6 {
            font-family: var(--font-stack-monospace);
            color: rgba(25, 25, 25, 1);
          }
          [data-nextjs-call-stack-frame] > p {
            padding-left: 1rem;
            font-size: 0.875rem;
            color: rgba(25, 25, 25, 0.5);
          }
        `,
      }}
    />
  )
}
