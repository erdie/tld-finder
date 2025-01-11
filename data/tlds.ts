import tldData from './iana-tld.json'

export interface TLD {
    domain: string
    type: string
    tldManager: string
}

export const tlds: TLD[] = tldData

