import { ExtractorInterface } from '../src/types.js'

declare global {
    interface Window {
        extractor: ExtractorInterface
    }
}
