import { Page } from '@playwright/test'

declare global {
    type PlaywrightPage = Page
    interface Window {
        bibbotObserver?: MutationObserver
        // random window stuff from news sites that we need to deal with
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        oonObj: any
    }
}
